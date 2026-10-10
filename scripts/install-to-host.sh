#!/usr/bin/env bash
# Build + pack the tool and copy into Tool Forge app_data/tools/<manifest.id>/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm pack:tool

ID="$(node -p "JSON.parse(require('fs').readFileSync('tool/manifest.json','utf8')).id")"
if [[ -z "$ID" || "$ID" == "undefined" ]]; then
  echo "tool/manifest.json missing id" >&2
  exit 1
fi

SRC="$ROOT/dist-tool/$ID"
APP_DATA="${TOOLFORGE_APP_DATA:-$HOME/Library/Application Support/cn.natureworkds.toolforge}"
DEST="$APP_DATA/tools/$ID"

if [[ ! -d "$SRC" ]]; then
  echo "missing pack output: $SRC" >&2
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
echo "installed -> $DEST"
ls -la "$DEST"
