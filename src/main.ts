import { existsSync, statSync } from "fs";
import { Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, setIcon } from "obsidian";
import { isKnownLang, locales, setLang, t, type LangSetting } from "./i18n";
import { expandHome } from "./paths";
import { TerminalView, VIEW_TYPE_TERMINAL } from "./view";
import type { TermTheme } from "./theme";

export const MIN_FONT = 9;
export const MAX_FONT = 22;
export const DEFAULT_FONT = 12;

export const MIN_RATIO = 15;
export const MAX_RATIO = 70;
export const DEFAULT_RATIO = 30;

/**
 * The private side of a workspace item, used only for sizing the panel.
 * Obsidian's public types stop at WorkspaceLeaf, which carries no dimensions.
 */
interface SplitItem {
	parent?: SplitItem;
	children?: SplitItem[];
	setDimension?(dim: number): void;
}

export interface OpenTerminalSettings {
	/** Where new shells start; empty means the vault folder */
	workingDir: string;
	/** Shell to launch; empty means $SHELL, and /bin/zsh when even that is unset */
	shellPath: string;
	/** Open the panel automatically once the workspace is ready */
	openOnStartup: boolean;
	/** Height of the bottom panel as a percentage of the editor area */
	panelRatio: number;
	/** Terminal palette; deliberately independent of the Obsidian theme */
	terminalTheme: TermTheme;
	/** xterm font size in px */
	fontSize: number;
	/** Interface language; "auto" follows Obsidian */
	language: LangSetting;
}

const DEFAULT_SETTINGS: OpenTerminalSettings = {
	workingDir: "",
	shellPath: "",
	openOnStartup: true,
	panelRatio: DEFAULT_RATIO,
	terminalTheme: "dark",
	fontSize: DEFAULT_FONT,
	language: "auto",
};

export default class OpenTerminalPlugin extends Plugin {
	settings: OpenTerminalSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		setLang(this.settings.language);

		this.registerView(VIEW_TYPE_TERMINAL, (leaf: WorkspaceLeaf) => new TerminalView(leaf, this));

		this.addRibbonIcon("square-terminal", t("app.ribbon"), () => {
			void this.openPanel();
		});

		this.addCommand({
			id: "open-panel",
			name: t("app.command.open"),
			callback: () => void this.openPanel(),
		});
		this.addCommand({
			id: "toggle-panel",
			name: t("app.command.toggle"),
			callback: () => void this.togglePanel(),
		});
		this.addCommand({
			id: "new-tab",
			name: t("app.command.newTab"),
			callback: () => void this.newTab(),
		});

		this.addSettingTab(new OpenTerminalSettingTab(this));

		// Waiting for layout-ready matters twice: the vault path is only settled
		// by then, and a workspace restored with the panel already in it must not
		// get a second one.
		this.app.workspace.onLayoutReady(() => {
			if (this.settings.openOnStartup) void this.openPanel();
		});
	}

	// ── panel placement ────────────────────────────────────
	/**
	 * Opens the terminal below the editor.
	 *
	 * The split is taken from the most recent leaf of the root split rather than
	 * from the active one: with focus in the file explorer, splitting the active
	 * leaf would put the terminal inside the sidebar.
	 */
	async openPanel(): Promise<void> {
		const workspace = this.app.workspace;
		const existing = workspace.getLeavesOfType(VIEW_TYPE_TERMINAL);
		if (existing.length > 0) {
			await workspace.revealLeaf(existing[0]);
			return;
		}

		const host = workspace.getMostRecentLeaf(workspace.rootSplit) ?? workspace.getLeaf(false);
		const leaf = workspace.createLeafBySplit(host, "horizontal", false);
		await leaf.setViewState({ type: VIEW_TYPE_TERMINAL, active: true });
		await workspace.revealLeaf(leaf);
		this.applyPanelRatio(leaf);
	}

	/** Ribbon and command counterpart: a second press closes the panel */
	async togglePanel(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL);
		if (existing.length === 0) {
			await this.openPanel();
			return;
		}
		// Detaching closes the view, which kills every shell in it
		for (const leaf of existing) leaf.detach();
	}

	/** Adds a tab to the open panel, opening the panel first if it is not there */
	async newTab(): Promise<void> {
		await this.openPanel();
		const view = this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL)[0]?.view;
		if (view instanceof TerminalView) view.addTab();
	}

	/**
	 * Sizes the panel to the configured share of the editor area.
	 *
	 * The split sizes tab containers, not leaves, so the leaf's parent is what
	 * gets a dimension — and every sibling needs one, because a container left
	 * at null is treated as "as small as possible" and the terminal takes the
	 * whole area instead of its share.
	 *
	 * `setDimension` is not public API: a split otherwise opens at an even
	 * 50/50, which is far too tall for a terminal. It is wrapped because an
	 * Obsidian release may drop it, and an unsized panel is still usable.
	 */
	private applyPanelRatio(leaf: WorkspaceLeaf): void {
		const tabs = (leaf as unknown as { parent?: SplitItem }).parent;
		const children = tabs?.parent?.children;
		if (!tabs || !children || children.length < 2) return;
		const share = this.settings.panelRatio;
		const rest = (100 - share) / (children.length - 1);
		try {
			for (const child of children) child.setDimension?.(child === tabs ? share : rest);
		} catch {
			// Left at the default height; the user can still drag the divider
		}
	}

	/** Re-applies the height setting to an already open panel */
	applyPanelHeight(): void {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL)) {
			this.applyPanelRatio(leaf);
		}
	}

	// ── shell environment ──────────────────────────────────
	/** Absolute path of the vault folder on disk */
	vaultRoot(): string {
		return (this.app.vault.adapter as unknown as { getBasePath(): string }).getBasePath();
	}

	/**
	 * Where a new shell starts. A folder that was renamed or unmounted since it
	 * was configured falls back to the vault, because node-pty throws on a
	 * missing cwd and the tab would open on an error instead of a shell.
	 */
	defaultCwd(): string {
		const configured = this.settings.workingDir.trim();
		if (configured.length > 0) {
			const abs = expandHome(configured);
			try {
				if (existsSync(abs) && statSync(abs).isDirectory()) return abs;
			} catch {
				// Unreadable path; fall through to the vault
			}
			new Notice(t("term.notice.badCwd", { path: abs }));
		}
		return this.vaultRoot();
	}

	shellPath(): string {
		const configured = this.settings.shellPath.trim();
		if (configured.length > 0) return expandHome(configured);
		return process.env.SHELL || "/bin/zsh";
	}

	/**
	 * Absolute path of the plugin on disk.
	 * node-pty is a native module and cannot be bundled into main.js, so it is
	 * loaded from here by absolute path.
	 */
	pluginDir(): string {
		const base = this.vaultRoot();
		return `${base}/${this.manifest.dir ?? `.obsidian/plugins/${this.manifest.id}`}`;
	}

	// ── open views ─────────────────────────────────────────
	private eachView(fn: (view: TerminalView) => void): void {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL)) {
			const view = leaf.view;
			if (view instanceof TerminalView) fn(view);
		}
	}

	/** Pushes a palette or font-size change into every open terminal */
	applyAppearance(): void {
		this.eachView((v) => v.applyAppearance());
	}

	/**
	 * Applies a new language. The ribbon and command names are registered once
	 * at load, so those follow on the next Obsidian restart; open views rebuild
	 * now, which restarts their shells.
	 */
	applyLanguage(): void {
		setLang(this.settings.language);
		this.eachView((v) => v.rebuild());
	}

	async loadSettings(): Promise<void> {
		const saved = (await this.loadData()) as Partial<OpenTerminalSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
		// A stored language that no longer ships — a locale file removed, or a
		// vault carried over from a newer build — falls back to following Obsidian
		if (this.settings.language !== "auto" && !isKnownLang(this.settings.language)) {
			this.settings.language = "auto";
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class OpenTerminalSettingTab extends PluginSettingTab {
	private plugin: OpenTerminalPlugin;

	constructor(plugin: OpenTerminalPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("otm-settings");

		this.hero();
		this.shellCard();
		this.panelCard();
		this.appearanceCard();
		this.languageCard();
	}

	private hero(): void {
		const hero = this.containerEl.createDiv({ cls: "otm-hero" });
		setIcon(hero.createDiv({ cls: "otm-hero-mark" }), "square-terminal");
		const text = hero.createDiv();
		text.createDiv({ cls: "otm-hero-title", text: "Open Terminal Panel" });
		text.createDiv({
			cls: "otm-hero-subtitle",
			text: t("app.subtitle", { version: this.plugin.manifest.version }),
		});
	}

	/** One section card; Setting rows attach to the returned body element */
	private card(icon: string, title: string, subtitle: string): HTMLElement {
		const card = this.containerEl.createDiv({ cls: "otm-card" });
		const head = card.createDiv({ cls: "otm-card-head" });
		setIcon(head.createDiv({ cls: "otm-card-icon" }), icon);
		const text = head.createDiv();
		text.createDiv({ cls: "otm-card-title", text: title });
		text.createDiv({ cls: "otm-card-subtitle", text: subtitle });
		return card.createDiv({ cls: "otm-card-body" });
	}

	// ── shell ───────────────────────────────────────────────
	private shellCard(): void {
		const body = this.card("terminal", t("settings.shell.title"), t("settings.shell.subtitle"));

		new Setting(body)
			.setName(t("settings.shell.cwd.name"))
			.setDesc(t("settings.shell.cwd.desc"))
			.addText((tx) => {
				tx.setPlaceholder(this.plugin.vaultRoot());
				tx.setValue(this.plugin.settings.workingDir);
				tx.onChange(async (v) => {
					this.plugin.settings.workingDir = v;
					await this.plugin.saveSettings();
				});
			});

		new Setting(body)
			.setName(t("settings.shell.path.name"))
			.setDesc(t("settings.shell.path.desc"))
			.addText((tx) => {
				tx.setPlaceholder(process.env.SHELL || "/bin/zsh");
				tx.setValue(this.plugin.settings.shellPath);
				tx.onChange(async (v) => {
					this.plugin.settings.shellPath = v;
					await this.plugin.saveSettings();
				});
			});

		const check = new Setting(body)
			.setName(t("settings.shell.check.name"))
			.setDesc(t("settings.shell.check.desc"));
		check.settingEl.addClass("otm-has-result");
		const result = check.settingEl.createDiv({ cls: "otm-result" });
		check.addButton((b) => {
			b.setButtonText(t("settings.shell.check.button"));
			b.setCta();
			b.onClick(() => {
				result.removeClass("is-ok");
				result.removeClass("is-error");
				const shell = this.plugin.shellPath();
				const cwd = this.plugin.defaultCwd();
				const problems: string[] = [];
				if (!existsSync(shell)) problems.push(t("settings.shell.check.noShell", { path: shell }));
				if (!existsSync(`${this.plugin.pluginDir()}/node_modules/node-pty/lib/index.js`)) {
					problems.push(t("settings.shell.check.noPty"));
				}
				if (problems.length > 0) {
					result.addClass("is-error");
					result.setText(problems.join(" "));
					return;
				}
				result.addClass("is-ok");
				result.setText(t("settings.shell.check.ok", { shell, cwd }));
			});
		});
	}

	// ── panel ───────────────────────────────────────────────
	private panelCard(): void {
		const body = this.card("panel-bottom", t("settings.panel.title"), t("settings.panel.subtitle"));

		new Setting(body)
			.setName(t("settings.panel.startup.name"))
			.setDesc(t("settings.panel.startup.desc"))
			.addToggle((tg) => {
				tg.setValue(this.plugin.settings.openOnStartup);
				tg.onChange(async (v) => {
					this.plugin.settings.openOnStartup = v;
					await this.plugin.saveSettings();
				});
			});

		const ratio = new Setting(body)
			.setName(t("settings.panel.ratio.name"))
			.setDesc(t("settings.panel.ratio.desc"));
		const ratioValue = ratio.controlEl.createSpan({
			cls: "otm-value",
			text: `${this.plugin.settings.panelRatio} %`,
		});
		ratio.addSlider((sl) => {
			sl.setLimits(MIN_RATIO, MAX_RATIO, 5);
			sl.setValue(this.plugin.settings.panelRatio);
			sl.onChange(async (v) => {
				this.plugin.settings.panelRatio = v;
				ratioValue.setText(`${v} %`);
				this.plugin.applyPanelHeight();
				await this.plugin.saveSettings();
			});
			// The number sits left of the slider, so the slider does not repeat it
			ratio.controlEl.insertBefore(ratioValue, sl.sliderEl);
		});
		ratio.addExtraButton((b) => {
			b.setIcon("rotate-ccw");
			b.setTooltip(t("settings.restore", { value: DEFAULT_RATIO }));
			b.onClick(async () => {
				this.plugin.settings.panelRatio = DEFAULT_RATIO;
				this.plugin.applyPanelHeight();
				await this.plugin.saveSettings();
				this.display();
			});
		});
	}

	// ── appearance ──────────────────────────────────────────
	private appearanceCard(): void {
		const body = this.card(
			"palette",
			t("settings.look.title"),
			t("settings.look.subtitle"),
		);

		new Setting(body)
			.setName(t("settings.look.theme.name"))
			.setDesc(t("settings.look.theme.desc"))
			.addDropdown((dd) => {
				dd.addOption("dark", t("settings.look.theme.dark"));
				dd.addOption("light", t("settings.look.theme.light"));
				dd.setValue(this.plugin.settings.terminalTheme);
				dd.onChange(async (v) => {
					this.plugin.settings.terminalTheme = v as TermTheme;
					await this.plugin.saveSettings();
					this.plugin.applyAppearance();
				});
			});

		const font = new Setting(body)
			.setName(t("settings.look.font.name"))
			.setDesc(t("settings.look.font.desc"));
		const fontValue = font.controlEl.createSpan({
			cls: "otm-value",
			text: `${this.plugin.settings.fontSize} px`,
		});
		font.addSlider((sl) => {
			sl.setLimits(MIN_FONT, MAX_FONT, 1);
			sl.setValue(this.plugin.settings.fontSize);
			sl.onChange(async (v) => {
				this.plugin.settings.fontSize = v;
				fontValue.setText(`${v} px`);
				this.plugin.applyAppearance();
				await this.plugin.saveSettings();
			});
			font.controlEl.insertBefore(fontValue, sl.sliderEl);
		});
		font.addExtraButton((b) => {
			b.setIcon("rotate-ccw");
			b.setTooltip(t("settings.restore", { value: DEFAULT_FONT }));
			b.onClick(async () => {
				this.plugin.settings.fontSize = DEFAULT_FONT;
				this.plugin.applyAppearance();
				await this.plugin.saveSettings();
				this.display();
			});
		});
	}

	// ── language ────────────────────────────────────────────
	private languageCard(): void {
		const body = this.card(
			"languages",
			t("settings.language.title"),
			t("settings.language.subtitle"),
		);

		new Setting(body)
			.setName(t("settings.language.name"))
			.setDesc(t("settings.language.desc"))
			.addDropdown((dd) => {
				dd.addOption("auto", t("settings.language.auto"));
				// Built from the locale registry, so a new language file shows up
				// here without touching this method
				for (const loc of locales()) dd.addOption(loc.code, loc.label);
				dd.setValue(this.plugin.settings.language);
				dd.onChange(async (v) => {
					this.plugin.settings.language = v as LangSetting;
					await this.plugin.saveSettings();
					this.plugin.applyLanguage();
					new Notice(t("settings.language.changed"));
					// Redraw this tab too, so the labels switch immediately
					this.display();
				});
			});

		// Says plainly which tables are machine-translated. It goes after the row
		// rather than inside it: a .setting-item is one flex line, and a long
		// description pushes the dropdown onto a line of its own.
		body.createDiv({ cls: "otm-card-note" }).setText(t("settings.language.community"));
	}
}
