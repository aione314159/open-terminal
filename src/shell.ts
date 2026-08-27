/**
 * Wraps a path in POSIX single quotes before it is typed into the terminal.
 *
 * Double quotes would still expand $, ` and \, so a folder named `$(id)` would
 * execute instead of being typed. Inside single quotes the only character with
 * meaning is the quote itself, which is closed, escaped and reopened.
 */
export function shellQuote(s: string): string {
	return `'${s.split("'").join("'\\''")}'`;
}
