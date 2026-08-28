import type { Table } from "./zh";

const en: Table = {
	"app.ribbon": "Open Terminal — open the terminal panel",
	"app.viewTitle": "Terminal",
	"app.command.open": "Open the terminal panel",
	"app.command.toggle": "Toggle the terminal panel",
	"app.command.newTab": "New terminal tab",
	"app.subtitle": "A terminal panel below the editor · v{version}",

	"term.cdVault": "Go to the vault folder (sends cd)",
	"term.cdNote": "Go to the folder of the current note (sends cd)",
	"term.clear": "Clear the screen (does not touch a running command)",
	"term.restart": "End and restart this tab's shell",
	"term.toLight": "Switch to a light terminal",
	"term.toDark": "Switch to a dark terminal",
	"term.newTab": "New tab",
	"term.closeTab": "Close tab",
	"term.settings": "Open the plugin settings",
	"term.ended": "[Session ended — press the restart button to start a new one]",
	"term.error.title": "The terminal could not start.",
	"term.error.hint":
		"The component may be damaged. Delete node_modules/node-pty in the plugin folder, then reopen the panel and download it again.",
	"term.notice.noNote": "No note is open right now",
	"term.notice.badCwd": "Configured working folder not found; using the vault instead: {path}",

	"runtime.title": "The terminal needs one more component",
	"runtime.body":
		"The community store only installs main.js, manifest.json and styles.css, so node-pty — a native module — cannot reach you with the plugin. The button below downloads the build for your platform from this plugin's own GitHub release. It is a one-time step.",
	"runtime.install": "Download and install",
	"runtime.working": "Downloading…",
	"runtime.done": "Installed {files} files ({size}), SHA-256 {sha}…",
	"runtime.failed": "Install failed: {error}",
	"runtime.unsupported": "No prebuilt component for {platform}.",

	"settings.shell.title": "Shell",
	"settings.shell.subtitle": "Which shell new tabs run, and where they start",
	"settings.shell.cwd.name": "Working folder",
	"settings.shell.cwd.desc":
		"Starting folder for new tabs; ~ is expanded. Leave empty to use the vault folder.",
	"settings.shell.path.name": "Shell path",
	"settings.shell.path.desc":
		"Leave empty to use $SHELL. Started as a login shell, so PATH and your profile are complete.",
	"settings.shell.check.name": "Test the setup",
	"settings.shell.check.desc": "Check the shell path, the working folder and node-pty",
	"settings.shell.check.button": "Test",
	"settings.shell.check.ok": "All good. Shell: {shell}, starting folder: {cwd}",
	"settings.shell.check.noShell": "Shell not found: {path}.",
	"settings.shell.check.noPty":
		"The terminal component is not installed yet; open the terminal panel and use the download button.",

	"settings.panel.title": "Panel",
	"settings.panel.subtitle": "How the terminal opens below the editor",
	"settings.panel.startup.name": "Always open on startup",
	"settings.panel.startup.desc":
		"Open the panel on every start. Off, it comes back only when it was open as you quit Obsidian.",
	"settings.panel.ratio.name": "Panel height",
	"settings.panel.ratio.desc":
		"Percentage of the editor area. You can still drag the divider afterwards.",

	"settings.look.title": "Appearance",
	"settings.look.subtitle": "The terminal's own palette and font size",
	"settings.look.theme.name": "Terminal palette",
	"settings.look.theme.desc":
		"Deliberately independent of the Obsidian theme: the 16 ANSI colors need a fixed contrast baseline.",
	"settings.look.theme.dark": "Dark",
	"settings.look.theme.light": "Light",
	"settings.look.font.name": "Font size",
	"settings.look.font.desc":
		"In pixels. Applies to every tab; rows and columns are recalculated.",
	"settings.restore": "Restore default ({value})",

	"settings.language.title": "Language",
	"settings.language.subtitle": "Language used for this plugin's interface",
	"settings.language.name": "Interface language",
	"settings.language.desc": "Open panels are rebuilt on change, which ends running sessions.",
	"settings.language.auto": "Follow Obsidian",
	"settings.language.changed": "Language switched",
	"settings.language.community":
		"日本語, 한국어, Deutsch and Français are community translations with no native-speaker review. Please report anything that reads wrong.",
};

export default en;
