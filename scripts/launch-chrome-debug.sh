#!/usr/bin/env bash

set -euo pipefail

CHROME_BIN="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
DEBUG_PORT="${DEBUG_PORT:-9222}"
APP_URL="${1:-http://127.0.0.1:5173}"
PROFILE_DIR="${PROFILE_DIR:-/tmp/routine-tracker-chrome-debug}"
DEVTOOLS_LIST_URL="http://127.0.0.1:${DEBUG_PORT}/json/list"

if [ ! -x "$CHROME_BIN" ]; then
  echo "Chrome binary not found at: $CHROME_BIN" >&2
  echo "Set CHROME_BIN to your Chrome executable and retry." >&2
  exit 1
fi

mkdir -p "$PROFILE_DIR"

echo "Launching Chrome with remote debugging on port ${DEBUG_PORT}"
echo "App URL: ${APP_URL}"
echo "Profile dir: ${PROFILE_DIR}"

open -na "$CHROME_BIN" --args \
  --remote-debugging-port="${DEBUG_PORT}" \
  --user-data-dir="${PROFILE_DIR}" \
  --no-first-run \
  --no-default-browser-check \
  "${APP_URL}"

echo
echo "DevTools target list:"
echo "  ${DEVTOOLS_LIST_URL}"
echo
echo "If Codex is using repo-local MCP config, it can attach through .mcp.json."
