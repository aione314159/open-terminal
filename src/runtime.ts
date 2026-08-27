import { createHash } from "crypto";
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { gunzipSync } from "zlib";
import { requestUrl } from "obsidian";
import { dirName } from "./paths";

/**
 * The terminal needs node-pty, which is a native module: the community store
 * only ever installs main.js, manifest.json and styles.css, so the binary
 * cannot ship with the plugin. It is fetched from this plugin's own GitHub
 * release instead, once, after the user asks for it.
 *
 * Nothing is downloaded on load or in the background — `TerminalSession` shows
 * a panel with the exact URL and a button, and only a click gets here.
 */

/** Owner and repo the archives are published under; also shown to the user */
const REPO = "aione314159/open-terminal";

/** Everything the runtime needs, relative to the plugin folder */
const PTY_ENTRY = "node_modules/node-pty/lib/index.js";

/**
 * Platforms with a published archive.
 *
 * macOS only for now: those are the builds this project can produce and
 * actually verify. On anything else the panel says so and points at the
 * install script, which builds node-pty from npm on the machine itself.
 */
const PLATFORMS: Record<string, string> = {
	"darwin-arm64": "darwin-arm64",
	"darwin-x64": "darwin-x64",
};

export function platformTag(): string | null {
	const key = `${process.platform}-${process.arch}`;
	return PLATFORMS[key] ?? null;
}

/** Where the archive for this platform and version lives */
export function archiveUrl(version: string): string {
	return `https://github.com/${REPO}/releases/download/${version}/node-pty-${platformTag()}.tar.gz`;
}

export function isInstalled(pluginDir: string): boolean {
	return existsSync(`${pluginDir}/${PTY_ENTRY}`);
}

export interface InstallReport {
	files: number;
	bytes: number;
	sha256: string;
}

/**
 * Downloads the archive for this platform and unpacks it into the plugin
 * folder. Throws with a message meant to be shown as-is; the caller decides
 * how to present it.
 */
export async function install(pluginDir: string, version: string): Promise<InstallReport> {
	if (platformTag() === null) {
		throw new Error(`unsupported platform: ${process.platform}-${process.arch}`);
	}
	const url = archiveUrl(version);
	const res = await requestUrl({ url, throw: false });
	if (res.status !== 200) {
		throw new Error(`${url} returned HTTP ${res.status}`);
	}

	const gz = Buffer.from(res.arrayBuffer);
	// Recorded and shown after the install so a user can compare it with the
	// checksum published next to the release
	const sha256 = createHash("sha256").update(gz).digest("hex");
	const tar = gunzipSync(gz);
	const files = unpack(tar, pluginDir);

	if (!isInstalled(pluginDir)) {
		throw new Error(`archive did not contain ${PTY_ENTRY}`);
	}
	return { files, bytes: gz.length, sha256 };
}

/**
 * Minimal tar reader: the archive is produced by this project's own pack
 * script, so only regular files and directories in the ustar format appear.
 * Anything else — symlinks, hard links, device nodes — is skipped rather than
 * trusted, and so is any path that tries to escape the plugin folder.
 *
 * Exported for cli/test_unpack.mjs: getting this wrong breaks the install for
 * every store user at once, so it is checked against a real archive.
 */
export function unpack(tar: Buffer, dest: string): number {
	const BLOCK = 512;
	let offset = 0;
	let written = 0;

	while (offset + BLOCK <= tar.length) {
		const header = tar.subarray(offset, offset + BLOCK);
		const name = cstring(header.subarray(0, 100));
		// Two zeroed blocks mark the end of the archive
		if (name === "") break;

		const size = octal(header.subarray(124, 136));
		const mode = octal(header.subarray(100, 108));
		const type = String.fromCharCode(header[156]) || "0";
		const prefix = cstring(header.subarray(345, 500));
		const path = prefix ? `${prefix}/${name}` : name;

		offset += BLOCK;
		const body = tar.subarray(offset, offset + size);
		// File bodies are padded to a whole number of blocks
		offset += Math.ceil(size / BLOCK) * BLOCK;

		if (!isSafePath(path)) continue;
		const target = `${dest}/${path}`;

		if (type === "5") {
			mkdirSync(target, { recursive: true });
			continue;
		}
		if (type !== "0" && type !== "\0") continue;

		mkdirSync(dirName(target), { recursive: true });
		writeFileSync(target, body);
		// spawn-helper is executed by node-pty and is useless without +x
		if (mode & 0o111) chmodSync(target, 0o755);
		written++;
	}
	return written;
}

/** Rejects absolute paths and anything containing a .. segment */
function isSafePath(path: string): boolean {
	if (path.length === 0 || path.startsWith("/")) return false;
	return !path.split("/").includes("..");
}

function cstring(buf: Buffer): string {
	const end = buf.indexOf(0);
	return buf.subarray(0, end === -1 ? buf.length : end).toString("utf8").trim();
}

function octal(buf: Buffer): number {
	const text = cstring(buf);
	return text === "" ? 0 : parseInt(text, 8) || 0;
}
