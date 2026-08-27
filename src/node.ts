/**
 * Typed access to the handful of Node APIs this plugin needs.
 *
 * The community directory runs its review lint without `@types/node`, so there
 * every Node global and every `fs` import reads as `any`, and each use is
 * reported as an unsafe call, access or assignment. Naming the shapes once
 * here keeps the rest of the source typed under both setups, and confines the
 * widening to this file.
 *
 * Only what the terminal actually needs is exposed: the environment and
 * platform of the running process, and the file operations that unpack the
 * downloaded native component.
 */

import { chmodSync, existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { gunzipSync } from "zlib";

interface NodeProcess {
	env: Record<string, string | undefined>;
	platform: string;
	arch: string;
}

/**
 * The running process: its environment, platform and architecture.
 *
 * Reached through `window` rather than `globalThis`, which is what Obsidian
 * asks for so popout windows resolve against their own context.
 */
export const proc: NodeProcess = (window as unknown as { process: NodeProcess }).process;

interface Stats {
	isDirectory(): boolean;
}

const stat = statSync as unknown as (path: string) => Stats;
const hash = createHash as unknown as (
	algorithm: string,
) => { update(data: Uint8Array): { digest(encoding: string): string } };

export const fileExists = existsSync as unknown as (path: string) => boolean;

/** True only for a path that exists and is a directory; throws are the caller's */
export function isDirectory(path: string): boolean {
	return stat(path).isDirectory();
}

export const makeDir = mkdirSync as unknown as (
	path: string,
	options: { recursive: boolean },
) => void;

export const writeFile = writeFileSync as unknown as (path: string, data: Uint8Array) => void;

export const setMode = chmodSync as unknown as (path: string, mode: number) => void;

export const gunzip = gunzipSync as unknown as (data: Uint8Array) => Uint8Array;

/** Hex SHA-256 of a buffer, shown after an install so it can be compared */
export function sha256(data: Uint8Array): string {
	return hash("sha256").update(data).digest("hex");
}
