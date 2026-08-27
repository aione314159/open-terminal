import de from "./de";
import en from "./en";
import fr from "./fr";
import ja from "./ja";
import ko from "./ko";
import zh, { type Table } from "./zh";

/**
 * The locale registry. Adding a language means adding a file next to this one
 * and a single entry to LOCALES — nothing in i18n.ts, main.ts or view.ts has
 * to change, and the language dropdown in the settings tab is built from here.
 */
export interface Locale {
	/** BCP 47 prefix matched against the Obsidian interface language */
	code: string;
	/** Shown in the dropdown, written in the language itself so it is
	 *  readable no matter which language is currently active */
	label: string;
	/** false marks a community translation with no native-speaker review */
	reviewed: boolean;
	table: Table;
}

export const LOCALES: Locale[] = [
	{ code: "en", label: "English", reviewed: true, table: en },
	{ code: "zh", label: "繁體中文", reviewed: true, table: zh },
	{ code: "ja", label: "日本語", reviewed: false, table: ja },
	{ code: "ko", label: "한국어", reviewed: false, table: ko },
	{ code: "de", label: "Deutsch", reviewed: false, table: de },
	{ code: "fr", label: "Français", reviewed: false, table: fr },
];

/** The language every lookup falls back to when a key is missing */
export const FALLBACK = "en";

export type { StringKey, Table } from "./zh";
