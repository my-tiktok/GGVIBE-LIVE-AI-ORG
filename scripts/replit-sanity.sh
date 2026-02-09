#!/usr/bin/env bash
set -euo pipefail

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"

cd ggvibe

npm ci --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=1536" npm run build
