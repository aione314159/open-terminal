import { ItemView, Notice, WorkspaceLeaf, setIcon } from "obsidian";
import { t } from "./i18n";
import { dirName, shortPath } from "./paths";
import { TerminalSession } from "./session";
import { TERM_THEMES } from "./theme";
import type OpenTerminalPlugin from "./main";

export const VIEW_TYPE_TERMINAL = "open-terminal-panel-view";

/**
 * The terminal panel. One view holds several sessions as tabs; only the active
 * one is displayed, the rest keep running behind `display: none`.
 */
export class TerminalView extends ItemView {
	private plugin: OpenTerminalPlugin;
	private tabsEl!: HTMLElement;
	private bodyEl!: HTMLElement;
	private cwdEl!: HTMLElement;
	private themeBtn!: HTMLElement;

	private sessions: TerminalSession[] = [];
	private activeId = "";

	constructor(leaf: WorkspaceLeaf, plugin: OpenTerminalPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_TERMINAL;
	}

	getDisplayText(): string {
		return t("app.viewTitle");
	}

	getIcon(): string {
		return "square-terminal";
	}

	async onOpen(): Promise<void> {
		this.build();
		this.newSession();
	}

	async onClose(): Promise<void> {
		for (const s of this.sessions) s.dispose();
		this.sessions = [];
	}

	// ── layout ─────────────────────────────────────────────
	private build(): void {
		const root = this.contentEl;
		root.empty();
		root.addClass("otm-root");

		const head = root.createDiv({ cls: "otm-head" });
		this.tabsEl = head.createDiv({ cls: "otm-tabs" });

		const actions = head.createDiv({ cls: "otm-actions" });
		this.cwdEl = actions.createDiv({ cls: "otm-cwd" });

		this.themeBtn = this.actionBtn(actions, "moon", "", () => void this.toggleTheme());
		this.syncThemeBtn();
		this.actionBtn(actions, "home", t("term.cdVault"), () =>
			this.activeSession()?.cd(this.plugin.vaultRoot()),
		);
		this.actionBtn(actions, "file-symlink", t("term.cdNote"), () => this.cdToNoteFolder());
		this.actionBtn(actions, "eraser", t("term.clear"), () => this.activeSession()?.clear());
		this.actionBtn(actions, "rotate-ccw", t("term.restart"), () => this.restartActive());
		this.actionBtn(actions, "settings", t("term.settings"), () => this.plugin.openSettings());

		this.bodyEl = root.createDiv({ cls: "otm-body" });
		this.applyAppearance();
	}

	private actionBtn(
		parent: HTMLElement,
		icon: string,
		label: string,
		onClick: () => void,
	): HTMLElement {
		const b = parent.createEl("button", { cls: "otm-icon-btn", attr: { "aria-label": label } });
		setIcon(b, icon);
		b.addEventListener("click", onClick);
		return b;
	}

	// ── sessions ───────────────────────────────────────────
	/** Opens a tab in the configured working folder and focuses it */
	newSession(): void {
		const cwd = this.plugin.defaultCwd();
		const session = new TerminalSession(this.bodyEl, this.plugin, cwd);
		session.onExit = () => this.drawTabs();
		this.sessions.push(session);
		session.start();
		this.activate(session.id);
		this.drawTabs();
	}

	private activeSession(): TerminalSession | null {
		return this.sessions.find((s) => s.id === this.activeId) ?? null;
	}

	private activate(id: string): void {
		this.activeId = id;
		for (const s of this.sessions) s.setActive(s.id === id);
		this.drawTabs();
		const active = this.activeSession();
		if (active) {
			this.cwdEl.setText(shortPath(active.cwd));
			this.cwdEl.setAttr("aria-label", active.cwd);
		}
	}

	private closeSession(id: string): void {
		const at = this.sessions.findIndex((s) => s.id === id);
		if (at < 0) return;
		this.sessions[at].dispose();
		this.sessions.splice(at, 1);
		// A view with no terminal in it is not a terminal view; open a fresh one
		if (this.sessions.length === 0) {
			this.newSession();
			return;
		}
		if (this.activeId === id) {
			// Focus moves to the neighbour on the left, the way editor tabs do
			this.activate(this.sessions[Math.max(0, at - 1)].id);
			return;
		}
		this.drawTabs();
	}

	private restartActive(): void {
		const active = this.activeSession();
		if (!active) return;
		active.restart();
		this.drawTabs();
	}

	/** Types a cd to the folder holding the note that is currently open */
	private cdToNoteFolder(): void {
		const session = this.activeSession();
		if (!session) return;
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice(t("term.notice.noNote"));
			return;
		}
		const folder = file.parent?.path ?? dirName(file.path);
		const root = this.plugin.vaultRoot();
		session.cd(folder === "/" || folder === "" ? root : `${root}/${folder}`);
	}

	// ── tab strip ──────────────────────────────────────────
	private drawTabs(): void {
		this.tabsEl.empty();

		this.sessions.forEach((s, i) => {
			const tab = this.tabsEl.createDiv({ cls: "otm-tab" });
			tab.toggleClass("is-active", s.id === this.activeId);
			// A shell that exited is kept so its output stays readable; the dot says so
			tab.toggleClass("is-dead", !s.alive);
			tab.createSpan({ cls: "otm-tab-index", text: String(i + 1) });
			tab.createSpan({ cls: "otm-tab-title", text: s.title });
			tab.setAttr("aria-label", s.cwd);
			tab.addEventListener("click", () => this.activate(s.id));
			// Middle click closes, as it does on browser and editor tabs
			tab.addEventListener("auxclick", (e: MouseEvent) => {
				if (e.button === 1) this.closeSession(s.id);
			});

			const close = tab.createEl("button", {
				cls: "otm-tab-close",
				attr: { "aria-label": t("term.closeTab") },
			});
			setIcon(close, "x");
			close.addEventListener("click", (e: MouseEvent) => {
				e.stopPropagation();
				this.closeSession(s.id);
			});
		});

		const add = this.tabsEl.createEl("button", {
			cls: "otm-tab-add",
			attr: { "aria-label": t("term.newTab") },
		});
		setIcon(add, "plus");
		add.addEventListener("click", () => this.newSession());
	}

	// ── appearance ─────────────────────────────────────────
	private async toggleTheme(): Promise<void> {
		this.plugin.settings.terminalTheme =
			this.plugin.settings.terminalTheme === "dark" ? "light" : "dark";
		await this.plugin.saveSettings();
		this.plugin.applyAppearance();
	}

	/** The icon shows what pressing it switches to, hence a sun while dark */
	private syncThemeBtn(): void {
		const dark = this.plugin.settings.terminalTheme === "dark";
		setIcon(this.themeBtn, dark ? "sun" : "moon");
		this.themeBtn.setAttr("aria-label", dark ? t("term.toLight") : t("term.toDark"));
	}

	/** Called by the plugin after the theme or font size changed */
	applyAppearance(): void {
		const name = this.plugin.settings.terminalTheme;
		this.contentEl.toggleClass("is-light", name === "light");
		// A custom property rather than a concrete style: the palette is a
		// runtime value, but the rule that uses it stays in styles.css
		this.contentEl.style.setProperty("--otm-term-bg", TERM_THEMES[name].background);
		this.syncThemeBtn();
		for (const s of this.sessions) s.applyAppearance();
	}

	/** Called by the plugin's "new tab" command */
	addTab(): void {
		this.newSession();
	}

	/** Rebuilt from scratch after the interface language changed */
	rebuild(): void {
		for (const s of this.sessions) s.dispose();
		this.sessions = [];
		this.activeId = "";
		this.build();
		this.newSession();
	}
}
