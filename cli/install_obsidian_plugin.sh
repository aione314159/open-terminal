#!/bin/bash
# title: Install the Open Terminal Panel plugin into an Obsidian vault
# description: Build the Open Terminal Panel Obsidian plugin and install it into a given or auto-detected vault
# tags: cli,obsidian,plugin,build,install

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_ID="open-terminal-panel"
VAULT="${1:-}"

print_separator() { echo "=============================="; }
print_header()    { print_separator; echo "  $1"; print_separator; }
log_info()        { echo -e "\033[36m[INFO]\033[0m  $*"; }
log_success()     { echo -e "\033[32m[OK]\033[0m    $*"; }
log_error()       { echo -e "\033[31m[ERROR]\033[0m $*" >&2; }

# Desktop notification. osascript only; terminal-notifier needs a separate
# permission grant and stays silent without failing when it is missing.
desktop_notify() {
  local title="$1" message="$2" sound="${3:-Glass}"
  command -v osascript >/dev/null 2>&1 || return 0
  osascript -e "display notification \"${message}\" with title \"${title}\" sound name \"${sound}\"" 2>/dev/null || true
}

trap 'log_error "Aborted (line $LINENO)"; desktop_notify "❌ Open Terminal Panel install failed" "The script stopped at line $LINENO; check the terminal output" "Basso"; exit 1' ERR

print_header "🔧 Install the Open Terminal Panel plugin into an Obsidian vault"
echo ""

# [desc] Pick the target vault: use the argument when given, otherwise take the first existing vault out of obsidian.json
print_header "=== STAGE: locate_vault ==="
if [ -z "$VAULT" ]; then
  VAULT="$(python3 - <<'PY'
import json, pathlib, sys
cfg = pathlib.Path.home() / "Library/Application Support/obsidian/obsidian.json"
if not cfg.exists():
    sys.exit("obsidian.json not found")
data = json.loads(cfg.read_text(encoding="utf-8"))
paths = [v["path"] for v in data.get("vaults", {}).values() if pathlib.Path(v["path"]).exists()]
if not paths:
    sys.exit("no usable vault in obsidian.json")
print(paths[0])
PY
)"
fi
[ -d "$VAULT" ] || { log_error "vault does not exist: $VAULT"; exit 1; }
PLUGIN_DIR="$VAULT/.obsidian/plugins/$PLUGIN_ID"
log_info "vault:           $VAULT"
log_info "install target:  $PLUGIN_DIR"
log_success "locate_vault done"
echo "=== STAGE: locate_vault Done ==="
echo ""

# [desc] Install dependencies, type-check with TypeScript and bundle with esbuild to produce main.js
print_header "=== STAGE: build ==="
cd "$PROJECT_ROOT"
[ -d node_modules ] || npm install
npm run build
log_success "build done"
echo "=== STAGE: build Done ==="
echo ""

# [desc] Copy main.js, manifest.json and styles.css into the vault's plugin folder
print_header "=== STAGE: install ==="
mkdir -p "$PLUGIN_DIR"
for f in main.js manifest.json styles.css; do
  [ -f "$PROJECT_ROOT/$f" ] || { log_error "source file not found: $PROJECT_ROOT/$f"; exit 1; }
done
cp "$PROJECT_ROOT/main.js" "$PLUGIN_DIR/"
cp "$PROJECT_ROOT/manifest.json" "$PLUGIN_DIR/"
cp "$PROJECT_ROOT/styles.css" "$PLUGIN_DIR/"
log_info "copied: main.js manifest.json styles.css"
log_success "install done"
echo "=== STAGE: install Done ==="
echo ""

# [desc] Copy node-pty's JS and the native module for this platform; without it there is no real TTY and the panel shows an error instead of a shell
print_header "=== STAGE: install_pty ==="
PTY_SRC="$PROJECT_ROOT/node_modules/node-pty"
[ -d "$PTY_SRC" ] || { log_error "node-pty not found; run npm install first"; exit 1; }

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PTY_PLATFORM="darwin-arm64" ;;
  Darwin-x86_64) PTY_PLATFORM="darwin-x64" ;;
  *) log_error "unsupported platform: $(uname -s)-$(uname -m)"; exit 1 ;;
esac
log_info "platform: $PTY_PLATFORM"

PREBUILD_SRC="$PTY_SRC/prebuilds/$PTY_PLATFORM"
[ -f "$PREBUILD_SRC/pty.node" ] || { log_error "$PREBUILD_SRC/pty.node not found"; exit 1; }

PTY_DST="$PLUGIN_DIR/node_modules/node-pty"
mkdir -p "$PTY_DST/prebuilds/$PTY_PLATFORM"

# From lib/ take only the .js needed at runtime: no test files, no source maps. Files are overwritten in place and old ones are left alone.
find "$PTY_SRC/lib" -name '*.js' ! -name '*.test.js' | while read -r f; do
  rel="${f#"$PTY_SRC/lib/"}"
  mkdir -p "$PTY_DST/lib/$(dirname "$rel")"
  cp "$f" "$PTY_DST/lib/$rel"
done

cp "$PREBUILD_SRC/pty.node" "$PTY_DST/prebuilds/$PTY_PLATFORM/"
cp "$PREBUILD_SRC/spawn-helper" "$PTY_DST/prebuilds/$PTY_PLATFORM/"
chmod +x "$PTY_DST/prebuilds/$PTY_PLATFORM/spawn-helper"

log_info "copied node-pty: $(find "$PTY_DST" -type f | wc -l | tr -d ' ') files, $(du -sh "$PTY_DST" | cut -f1)"
log_success "install_pty done"
echo "=== STAGE: install_pty Done ==="
echo ""

echo "Next:"
echo "  1. Open Obsidian"
echo "  2. Go to Settings -> Community plugins"
echo "  3. Click reload"
echo "  4. Enable \"Open Terminal Panel\""
echo ""

print_separator
log_success "✅ Done"
print_separator
desktop_notify "✅ Open Terminal Panel $(python3 -c "import json;print(json.load(open('$PROJECT_ROOT/manifest.json'))['version'])" 2>/dev/null || echo "") installed" "Reload community plugins in Obsidian and enable Open Terminal Panel"
