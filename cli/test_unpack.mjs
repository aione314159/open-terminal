/**
 * Unpacks a real archive from cli/pack_pty_runtime.sh with the same reader the
 * plugin uses, and checks the result against the staged tree.
 *
 * Run: node cli/test_unpack.mjs [dist/node-pty-<tag>.tar.gz]
 */
import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { gunzipSync } from "zlib";

const archive = process.argv[2] ?? `dist/node-pty-${process.platform}-${process.arch}.tar.gz`;
if (!existsSync(archive)) {
	console.error(`archive not found: ${archive}\nRun ./cli/pack_pty_runtime.sh first.`);
	process.exit(1);
}

// The reader lives in TypeScript; bundle just that module to run it here.
// `obsidian` is only imported for the download path, which this test does not
// touch, so it is aliased to a stub rather than left external — Node cannot
// resolve the real one outside the app.
const work = mkdtempSync(join(tmpdir(), "otm-"));
const stub = join(work, "obsidian-stub.js");
writeFileSync(stub, "export function requestUrl() { throw new Error('not used in this test'); }\n");
const bundle = join(work, "runtime.cjs");
execFileSync("npx", [
	"esbuild", "src/runtime.ts",
	"--bundle", "--format=cjs", "--platform=node",
	`--alias:obsidian=${stub}`, `--outfile=${bundle}`,
], { stdio: "pipe" });

// The plugin reads Node globals off `window`, which Obsidian provides and a
// bare Node process does not
globalThis.window = { process };

const { unpack } = await import(bundle);

const dest = mkdtempSync(join(tmpdir(), "otm-out-"));
const written = unpack(gunzipSync(readFileSync(archive)), dest);

const checks = [];
const check = (name, ok, detail = "") => {
	checks.push(ok);
	console.log(`${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

check("files were written", written > 0, `${written} files`);
check("node-pty entry point exists", existsSync(join(dest, "node_modules/node-pty/lib/index.js")));

// The reference listing comes from Python's tarfile rather than `tar -tvf`:
// that output is column- and locale-dependent, and parsing it by hand is how
// this test first produced a false failure.
const listing = JSON.parse(
	execFileSync("python3", [
		"-c",
		"import json,sys,tarfile\n" +
			"with tarfile.open(sys.argv[1]) as t:\n" +
			"    print(json.dumps([{'path': m.name, 'size': m.size} for m in t.getmembers() if m.isfile()]))",
		archive,
	], { encoding: "utf8" }),
);

const mismatched = listing.filter((f) => {
	const target = join(dest, f.path);
	return !existsSync(target) || statSync(target).size !== f.size;
});
check("every file matches tar's own listing", mismatched.length === 0, `${listing.length} files, ${mismatched.length} mismatched`);

const binary = listing.find((f) => f.path.endsWith("pty.node"));
check("the native binary is present", binary !== undefined && existsSync(join(dest, binary.path)));

const helper = listing.find((f) => f.path.endsWith("spawn-helper"));
const helperMode = helper ? statSync(join(dest, helper.path)).mode & 0o111 : 0;
check("spawn-helper is executable", helperMode !== 0, `mode ${helperMode.toString(8)}`);

// node-pty is loaded by absolute path at runtime; require it the same way
let loaded = "";
try {
	const { createRequire } = await import("module");
	const req = createRequire(import.meta.url);
	const pty = req(join(dest, "node_modules/node-pty/lib/index.js"));
	loaded = typeof pty.spawn === "function" ? "spawn() present" : "no spawn()";
} catch (e) {
	loaded = String(e);
}
check("the unpacked module loads and exposes spawn()", loaded === "spawn() present", loaded);

const failed = checks.filter((c) => !c).length;
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed === 0 ? 0 : 1);
