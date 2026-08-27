#!/bin/bash
# title: Pack the node-pty runtime for a release
# description: Build the node-pty archive the plugin downloads on first run, for the current platform
# tags: cli,release,node-pty,package

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${1:-$PROJECT_ROOT/dist}"
# Second argument overrides the platform, so a release can carry archives for
# platforms other than the one packing them — as long as node-pty ships a
# prebuild for it under node_modules.
TAG_OVERRIDE="${2:-}"

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

trap 'log_error "Aborted (line $LINENO)"; desktop_notify "❌ Open Terminal Panel runtime pack failed" "The script stopped at line $LINENO; check the terminal output" "Basso"; exit 1' ERR

print_header "📦 Pack the node-pty runtime"
echo ""

# [desc] Work out the platform tag the plugin asks for, which is process.platform-process.arch
print_header "=== STAGE: platform ==="
if [ -n "$TAG_OVERRIDE" ]; then
  TAG="$TAG_OVERRIDE"
else
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  TAG="darwin-arm64" ;;
    Darwin-x86_64) TAG="darwin-x64" ;;
    *) log_error "unsupported platform: $(uname -s)-$(uname -m)"; exit 1 ;;
  esac
fi
log_info "platform tag: $TAG"
log_success "platform done"
echo "=== STAGE: platform Done ==="
echo ""

# [desc] Stage only what the plugin loads at runtime: lib/*.js plus the prebuilt binary and its spawn helper
print_header "=== STAGE: stage ==="
PTY_SRC="$PROJECT_ROOT/node_modules/node-pty"
[ -d "$PTY_SRC" ] || { log_error "node-pty not found; run npm install first"; exit 1; }
[ -f "$PTY_SRC/prebuilds/$TAG/pty.node" ] || { log_error "$PTY_SRC/prebuilds/$TAG/pty.node not found"; exit 1; }

STAGE="$(mktemp -d)"
DEST="$STAGE/node_modules/node-pty"
mkdir -p "$DEST/prebuilds/$TAG"

find "$PTY_SRC/lib" -name '*.js' ! -name '*.test.js' | while read -r f; do
  rel="${f#"$PTY_SRC/lib/"}"
  mkdir -p "$DEST/lib/$(dirname "$rel")"
  cp "$f" "$DEST/lib/$rel"
done

cp "$PTY_SRC/prebuilds/$TAG/pty.node" "$DEST/prebuilds/$TAG/"
cp "$PTY_SRC/prebuilds/$TAG/spawn-helper" "$DEST/prebuilds/$TAG/"
chmod +x "$DEST/prebuilds/$TAG/spawn-helper"
cp "$PTY_SRC/LICENSE" "$DEST/LICENSE"
log_info "staged $(find "$DEST" -type f | wc -l | tr -d ' ') files"
log_success "stage done"
echo "=== STAGE: stage Done ==="
echo ""

# [desc] Write the gzipped tar the plugin unpacks into its own folder, plus a checksum to publish beside it
print_header "=== STAGE: archive ==="
mkdir -p "$OUT_DIR"
ARCHIVE="$OUT_DIR/node-pty-$TAG.tar.gz"
# Ownership and timestamps are stripped so the same input always produces the same archive
tar --format=ustar --numeric-owner --owner=0 --group=0 -czf "$ARCHIVE" -C "$STAGE" node_modules
# The staging tree is a mktemp directory created a few lines above; nothing else lives there
rm -r "$STAGE"

SUM="$(shasum -a 256 "$ARCHIVE" | cut -d' ' -f1)"
# .txt, not a bare .sha256: GitHub's release uploader rejects extensions
# outside its allow-list, and the checksum would silently fail to attach
echo "$SUM  $(basename "$ARCHIVE")" > "$ARCHIVE.sha256.txt"
log_info "archive: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
log_info "sha256:  $SUM"
log_success "archive done"
echo "=== STAGE: archive Done ==="
echo ""

echo "Attach both files to the GitHub release whose tag matches manifest.json:"
echo "  $ARCHIVE"
echo "  $ARCHIVE.sha256.txt"
echo ""

print_separator
log_success "✅ Done"
print_separator
desktop_notify "✅ Open Terminal Panel runtime packed ($TAG)" "Attach node-pty-$TAG.tar.gz to the GitHub release"
