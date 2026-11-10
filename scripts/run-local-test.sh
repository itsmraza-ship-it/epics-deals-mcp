#!/usr/bin/env bash
# Build, boot the Node entry on a scratch port, run the full MCP test client,
# and save the transcript to test-results.md in the project root.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=8799
export PORT

npm run build >/dev/null
node dist/node-server.js &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -s "http://localhost:${PORT}/health" >/dev/null 2>&1; then break; fi
  sleep 0.3
done

MCP_URL="http://localhost:${PORT}/mcp" node scripts/test-client.mjs | tee test-results.md
