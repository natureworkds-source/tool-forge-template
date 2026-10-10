#!/usr/bin/env bash
# Pack the repo source for GitHub Release. Zip name follows package.json "name"
# so forks only need to rename the package — not this script or the workflow files.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NAME="$(node -p "require('./package.json').name")"
if [[ -z "$NAME" || "$NAME" == "undefined" ]]; then
  echo "package.json missing name" >&2
  exit 1
fi
OUT="$ROOT/${NAME}-source.zip"
rm -f "$OUT"
zip -r "$OUT" . \
  -x './.git/*' \
  -x './node_modules/*' \
  -x './dist/*' \
  -x './dist-tool/*' \
  -x './crates/target/*' \
  -x './target/*' \
  -x './src/wasm-pkg/*' \
  -x './.superpowers/*' \
  -x "./${NAME}-source.zip" \
  -x './.DS_Store'
echo "wrote $OUT"
