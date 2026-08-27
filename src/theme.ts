export type TermTheme = "light" | "dark";

/**
 * xterm does not read CSS variables, so these must be literal colors.
 * The terminal deliberately does not follow the Obsidian theme; the user picks
 * light or dark in the header. Both palettes come from VS Code's Dark+ /
 * Light+ and define all 16 ANSI colors, otherwise colored output — a git diff,
 * a test runner — is unreadable on a light background.
 */
export const TERM_THEMES: Record<TermTheme, Record<string, string>> = {
	dark: {
		background: "#1e1e1e",
		foreground: "#d4d4d4",
		cursor: "#ffffff",
		cursorAccent: "#1e1e1e",
		selectionBackground: "rgba(255,255,255,0.28)",
		black: "#000000",
		red: "#cd3131",
		green: "#0dbc79",
		yellow: "#e5e510",
		blue: "#2472c8",
		magenta: "#bc3fbc",
		cyan: "#11a8cd",
		white: "#e5e5e5",
		brightBlack: "#666666",
		brightRed: "#f14c4c",
		brightGreen: "#23d18b",
		brightYellow: "#f5f543",
		brightBlue: "#3b8eea",
		brightMagenta: "#d670d6",
		brightCyan: "#29b8db",
		brightWhite: "#ffffff",
	},
	light: {
		background: "#ffffff",
		foreground: "#333333",
		cursor: "#333333",
		cursorAccent: "#ffffff",
		selectionBackground: "rgba(0,0,0,0.15)",
		black: "#000000",
		red: "#cd3131",
		green: "#00bc00",
		yellow: "#949800",
		blue: "#0451a5",
		magenta: "#bc05bc",
		cyan: "#0598bc",
		white: "#555555",
		brightBlack: "#666666",
		brightRed: "#cd3131",
		brightGreen: "#14ce14",
		brightYellow: "#b5ba00",
		brightBlue: "#0451a5",
		brightMagenta: "#bc05bc",
		brightCyan: "#0598bc",
		brightWhite: "#a5a5a5",
	},
};
