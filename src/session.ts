import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import type { IPty } from "node-pty";
import { t } from "./i18n";
import { baseName } from "./paths";
import { loadPty, shellEnv, type PtyApi } from "./pty";
import { archiveUrl, install, isInstalled, platformTag } from "./runtime";
import { shellQuote } from "./shell";
import { TERM_THEMES } from "./theme";
import type OpenTerminalPlugin from "./main";

/** Tab ids only have to be unique within one view, so a counter is enough */
let nextId = 1;

/**
 * One shell: an xterm instance, its pty, and the element they live in.
 *
 * The session owns nothing about the tab strip — the view draws that and reads
 * `title` and `alive` from here. Hiding a session only sets `display: none`;
 * the pty keeps running, which is the point of tabs.
 */
export class TerminalSession {
	readonly id = `t${nextId++}`;
	readonly containerEl: HTMLElement;
	/** Where the shell was started; shown in the header and used by the tab label */
	readonly cwd: string;

	private plugin: OpenTerminalPlugin;
	private term: Terminal | null = null;
	private fit: FitAddon | null = null;
	private pty: IPty | null = null;
	private observer: ResizeObserver | null = null;
	private exited = false;
	private failed = false;

	/** The view redraws the tab strip when a shell exits on its own */
	onExit: (() => void) | null = null;

	constructor(parent: HTMLElement, plugin: OpenTerminalPlugin, cwd: string) {
		this.plugin = plugin;
		this.cwd = cwd;
		this.containerEl = parent.createDiv({ cls: "otm-session" });
		this.containerEl.toggleClass("is-hidden", true);
	}

	get title(): string {
		return baseName(this.cwd);
	}

	get alive(): boolean {
		return !this.exited && !this.failed;
	}

	/** True once the pty could not be loaded at all; the view offers no restart then */
	get broken(): boolean {
		return this.failed;
	}

	// ── lifecycle ──────────────────────────────────────────
	start(): void {
		// node-pty cannot ship through the community store, so the first run on
		// a fresh install has nothing to spawn with. Ask before downloading it.
		if (!isInstalled(this.plugin.pluginDir())) {
			this.showInstallPrompt();
			return;
		}

		let api: PtyApi;
		try {
			api = loadPty(this.plugin.pluginDir());
		} catch (e) {
			this.showLoadError(String(e));
			return;
		}

		const term = new Terminal({
			fontFamily:
				getComputedStyle(document.body).getPropertyValue("--font-monospace") || "monospace",
			fontSize: this.plugin.settings.fontSize,
			cursorBlink: true,
			scrollback: 5000,
			theme: TERM_THEMES[this.plugin.settings.terminalTheme],
		});
		const fit = new FitAddon();
		term.loadAddon(fit);
		term.open(this.containerEl);
		fit.fit();

		let child: IPty;
		try {
			// A login shell: launched from the GUI, macOS hands Obsidian a very
			// short PATH, and only the profile puts node, brew and friends back.
			child = api.spawn(this.plugin.shellPath(), ["-l"], {
				name: "xterm-256color",
				cols: term.cols,
				rows: term.rows,
				cwd: this.cwd,
				env: shellEnv(),
			});
		} catch (e) {
			term.dispose();
			this.showLoadError(String(e));
			return;
		}

		child.onData((d: string) => term.write(d));
		child.onExit(() => {
			// Closing the tab kills the pty too, and the view is gone by then
			if (this.term !== term) return;
			this.exited = true;
			this.pty = null;
			term.write(`\r\n\x1b[2m${t("term.ended")}\x1b[0m\r\n`);
			this.onExit?.();
		});
		term.onData((d: string) => this.pty?.write(d));

		this.term = term;
		this.fit = fit;
		this.pty = child;

		// Any size change — the split dragged, the window resized, a sidebar
		// opened — needs a new row and column count
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.refit());
		this.observer.observe(this.containerEl);
	}

	/** Ends the current shell and starts a fresh one in the same folder */
	restart(): void {
		this.teardown();
		this.containerEl.empty();
		this.exited = false;
		this.failed = false;
		this.start();
		window.setTimeout(() => this.refit(), 0);
	}

	dispose(): void {
		this.teardown();
		this.containerEl.remove();
	}

	private teardown(): void {
		this.observer?.disconnect();
		this.observer = null;
		const old = this.term;
		// Cleared first, so the dying session's onExit cannot write into a disposed view
		this.term = null;
		this.fit = null;
		this.killPty();
		old?.dispose();
	}

	private killPty(): void {
		if (!this.pty) return;
		try {
			this.pty.kill();
		} catch {
			// Killing an already dead session throws; ignore it
		}
		this.pty = null;
	}

	// ── visibility and sizing ──────────────────────────────
	setActive(active: boolean): void {
		this.containerEl.toggleClass("is-hidden", !active);
		if (!active) return;
		window.setTimeout(() => {
			this.refit();
			this.term?.focus();
		}, 0);
	}

	focus(): void {
		this.term?.focus();
	}

	refit(): void {
		if (!this.fit || !this.term) return;
		if (this.containerEl.offsetHeight < 20 || this.containerEl.offsetWidth < 20) return;
		try {
			this.fit.fit();
		} catch {
			return;
		}
		this.pty?.resize(this.term.cols, this.term.rows);
	}

	// ── input ──────────────────────────────────────────────
	/** Types a cd into the shell. While something is running this is plain input, never a kill */
	cd(dir: string): void {
		this.run(`cd ${shellQuote(dir)}`);
	}

	/** Types a command and presses return */
	run(command: string): void {
		if (!this.pty) return;
		this.pty.write(`${command}\r`);
		this.term?.focus();
	}

	/** Clears the screen without touching the running shell */
	clear(): void {
		this.term?.clear();
		this.term?.focus();
	}

	// ── appearance ─────────────────────────────────────────
	applyAppearance(): void {
		if (!this.term) return;
		this.term.options.theme = TERM_THEMES[this.plugin.settings.terminalTheme];
		this.term.options.fontSize = this.plugin.settings.fontSize;
		this.refit();
	}

	/**
	 * Offered instead of a shell when the native runtime is missing.
	 *
	 * Nothing downloads on its own: the panel names the exact URL and waits for
	 * a click, because this fetches a binary that then runs on the user's
	 * machine.
	 */
	private showInstallPrompt(): void {
		this.failed = true;
		this.containerEl.empty();
		const box = this.containerEl.createDiv({ cls: "otm-setup" });
		box.createDiv({ cls: "otm-setup-title", text: t("runtime.title") });
		box.createDiv({ cls: "otm-setup-body", text: t("runtime.body") });

		if (platformTag() === null) {
			box.createDiv({
				cls: "otm-setup-status is-error",
				text: t("runtime.unsupported", { platform: `${process.platform}-${process.arch}` }),
			});
			this.onExit?.();
			return;
		}

		const url = archiveUrl(this.plugin.manifest.version);
		box.createEl("code", { cls: "otm-setup-url", text: url });

		const status = box.createDiv({ cls: "otm-setup-status" });
		const button = box.createEl("button", { cls: "mod-cta", text: t("runtime.install") });
		button.addEventListener("click", () => {
			button.disabled = true;
			status.removeClass("is-error");
			status.setText(t("runtime.working"));
			void install(this.plugin.pluginDir(), this.plugin.manifest.version)
				.then((report) => {
					status.setText(
						t("runtime.done", {
							files: report.files,
							size: `${Math.round(report.bytes / 1024)} KB`,
							sha: report.sha256.slice(0, 16),
						}),
					);
					// The shell starts in place; no reload of the plugin needed
					window.setTimeout(() => this.restart(), 600);
				})
				.catch((e: unknown) => {
					button.disabled = false;
					status.addClass("is-error");
					status.setText(t("runtime.failed", { error: String(e) }));
				});
		});

		this.onExit?.();
	}

	private showLoadError(msg: string): void {
		this.failed = true;
		this.containerEl.empty();
		const box = this.containerEl.createDiv({ cls: "otm-error" });
		box.createDiv({ cls: "otm-error-title", text: t("term.error.title") });
		box.createDiv({ cls: "otm-error-hint", text: t("term.error.hint") });
		box.createEl("pre", { text: msg });
		this.onExit?.();
	}
}
