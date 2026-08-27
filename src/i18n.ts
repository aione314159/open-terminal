/**
 * Runtime side of the i18n layer. Obsidian has no public locale API, so the
 * language is read from the same localStorage key the app itself writes
 * ("language"), and the user can override it in the plugin settings.
 *
 * The strings themselves live in src/locales; this file never mentions an
 * individual language, so adding one is a change to that folder alone.
 */

import { FALLBACK, LOCALES, type Locale, type StringKey } from "./locales";

/** A language code that has a table, e.g. "en" or "ja" */
export type Lang = string;
/** "auto" follows the Obsidian interface language */
export type LangSetting = "auto" | Lang;

export type { StringKey };

const BY_CODE = new Map<string, Locale>(LOCALES.map((l) => [l.code, l]));

/** Every language the plugin ships, in the order the dropdown shows them */
export function locales(): Locale[] {
	return LOCALES;
}

/** True when a stored setting still matches a language that ships today */
export function isKnownLang(code: string): boolean {
	return BY_CODE.has(code);
}

let current: Locale = BY_CODE.get(FALLBACK) ?? LOCALES[0];

/**
 * Obsidian stores the interface language in localStorage under "language".
 * An empty stored value means English; a missing key means the user never
 * changed it, so fall back to the browser locale. Only the part before the
 * first dash is matched, so "de-AT" and "pt-BR" both resolve the same way as
 * their base language.
 */
export function detectLang(): Lang {
	let stored: string | null = null;
	try {
		stored = window.localStorage.getItem("language");
	} catch {
		stored = null;
	}
	const raw = stored !== null ? stored : (navigator.language ?? "");
	const base = raw.toLowerCase().split("-")[0];
	return BY_CODE.has(base) ? base : FALLBACK;
}

/** Called on load and whenever the language setting changes */
export function setLang(pref: LangSetting): void {
	const code = pref === "auto" ? detectLang() : pref;
	current = BY_CODE.get(code) ?? BY_CODE.get(FALLBACK) ?? LOCALES[0];
}

export function currentLang(): Lang {
	return current.code;
}

/** True when the active language is a community translation */
export function currentIsCommunity(): boolean {
	return !current.reviewed;
}

/** Look up a string and fill in {placeholders} */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
	const fallback = BY_CODE.get(FALLBACK);
	let out = current.table[key] ?? fallback?.table[key] ?? key;
	if (vars) {
		for (const [name, value] of Object.entries(vars)) {
			out = out.split(`{${name}}`).join(String(value));
		}
	}
	return out;
}
