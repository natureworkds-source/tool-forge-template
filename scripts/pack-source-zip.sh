#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/tool-forge-template-source.zip"
rm -f "$OUT"
cd "$ROOT"
zip -r "$OUT" . \
  -x './.git/*' \
  -x './node_modules/*' \
  -x './dist/*' \
  -x './dist-tool/*' \
  -x './crates/target/*' \
  -x './src/wasm-pkg/*' \
  -x './tool-forge-template-source.zip' \
  -x './.DS_Store'
echo "wrote $OUT"
