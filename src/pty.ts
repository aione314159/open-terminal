import type { IPty } from "node-pty";
import { proc } from "./node";

/** Only spawn is used; the rest of the node-pty API is not needed here */
export interface PtyApi {
	// A property with a function type rather than a method: it is never
	// detached from the module object, and this shape says so
	spawn: (
		file: string,
		args: string[],
		opt: { name: string; cols: number; rows: number; cwd: string; env: Record<string, string> },
	) => IPty;
}

/**
 * node-pty is a native module: esbuild cannot bundle it, and it is not on
 * Obsidian's module resolution path. The install script copies lib/ and
 * prebuilds/ into the plugin folder, so it is loaded by absolute path.
 */
export function loadPty(pluginDir: string): PtyApi {
	// A property with a function type, not a method: it is called straight off
	// the window object and never detached
	const req = (window as unknown as { require: (m: string) => unknown }).require;
	return req(`${pluginDir}/node_modules/node-pty/lib/index.js`) as PtyApi;
}

/**
 * The process environment, as a plain string map for node-pty.
 * TERM and COLORTERM are forced: Obsidian is launched from the GUI, so neither
 * is inherited, and without them colored output degrades to plain text.
 */
export function shellEnv(): Record<string, string> {
	const env: Record<string, string> = {};
	for (const [k, v] of Object.entries(proc.env)) if (typeof v === "string") env[k] = v;
	env.TERM = "xterm-256color";
	env.COLORTERM = "truecolor";
	return env;
}
