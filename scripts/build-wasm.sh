#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/src/wasm-pkg"
# Keep CLI version identical to crates/tool-wasm → wasm-bindgen (workspace pin).
WASM_BINDGEN_VERSION="0.2.129"
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

need_cli=1
if command -v wasm-bindgen >/dev/null 2>&1; then
  installed="$(wasm-bindgen --version 2>/dev/null | awk '{print $2}' || true)"
  if [[ "$installed" == "$WASM_BINDGEN_VERSION" ]]; then
    need_cli=0
  else
    echo "wasm-bindgen CLI is $installed; want $WASM_BINDGEN_VERSION — reinstalling" >&2
  fi
fi
if [[ "$need_cli" -eq 1 ]]; then
  cargo install wasm-bindgen-cli --version "$WASM_BINDGEN_VERSION" --locked --force \
    2>/dev/null \
    || cargo install wasm-bindgen-cli --version "$WASM_BINDGEN_VERSION" --force
fi

wasm-bindgen \
  --target web \
  --out-dir "$OUT" \
  --out-name tool_wasm \
  "$WASM"
echo "wrote $OUT"
