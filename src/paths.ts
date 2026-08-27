/** Path helpers shared by the view header and the settings tab. */

/** Expands a leading ~ so a hand-typed setting works like it does in a shell */
export function expandHome(p: string): string {
	const home = process.env.HOME ?? "";
	if (!home) return p;
	if (p === "~") return home;
	if (p.startsWith("~/")) return `${home}${p.slice(1)}`;
	return p;
}

/** The header is narrow: collapse the home folder to ~ and keep the last three segments */
export function shortPath(p: string): string {
	const home = process.env.HOME ?? "";
	const short = home && p.startsWith(home) ? `~${p.slice(home.length)}` : p;
	const parts = short.split("/");
	return parts.length > 4 ? `…/${parts.slice(-3).join("/")}` : short;
}

/** Last segment of a path, used as the tab label; "/" has none, so fall back to it */
export function baseName(p: string): string {
	const parts = p.split("/").filter((x) => x.length > 0);
	return parts.length > 0 ? parts[parts.length - 1] : "/";
}

/** Drops the last segment; used to turn a note path into the folder holding it */
export function dirName(p: string): string {
	const at = p.lastIndexOf("/");
	return at <= 0 ? "/" : p.slice(0, at);
}
