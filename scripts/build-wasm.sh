#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/src/wasm-pkg"
mkdir -p "$OUT"
cd "$ROOT/crates"
rustup target add wasm32-unknown-unknown >/dev/null
cargo build -p tool-wasm --target wasm32-unknown-unknown --release
TARGET_DIR="${CARGO_TARGET_DIR:-$ROOT/crates/target}"
WASM="$TARGET_DIR/wasm32-unknown-unknown/release/tool_wasm.wasm"
if [[ ! -f "$WASM" ]]; then
  echo "missing wasm at $WASM" >&2
  exit 1
fi
if ! command -v wasm-bindgen >/dev/null 2>&1; then
  cargo install wasm-bindgen-cli --version 0.2.100 --locked 2>/dev/null || cargo install wasm-bindgen-cli --version 0.2.100
fi
# Match the wasm-bindgen crate version used by the lockfile as closely as possible.
wasm-bindgen \
  --target web \
  --out-dir "$OUT" \
  --out-name tool_wasm \
  "$WASM"
echo "wrote $OUT"
