#!/usr/bin/env bash
set -euo pipefail

echo "[guard] Checking root directory for stale Node artifacts..."
echo "[guard] Working directory: $(pwd)"

FAIL=0

if [ -f package.json ]; then
  echo "[guard] REMOVING stale root package.json"
  rm -f package.json
fi

if [ -f package-lock.json ]; then
  echo "[guard] REMOVING stale root package-lock.json"
  rm -f package-lock.json
fi

if [ -f yarn.lock ]; then
  echo "[guard] REMOVING stale root yarn.lock"
  rm -f yarn.lock
fi

if [ -f pnpm-lock.yaml ]; then
  echo "[guard] REMOVING stale root pnpm-lock.yaml"
  rm -f pnpm-lock.yaml
fi

if [ -d node_modules ]; then
  echo "[guard] REMOVING stale root node_modules/"
  rm -rf node_modules
fi

if [ ! -f ggvibe/package.json ]; then
  echo "[guard] FATAL: ggvibe/package.json not found"
  FAIL=1
fi

if [ ! -f ggvibe/package-lock.json ]; then
  echo "[guard] FATAL: ggvibe/package-lock.json not found"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "[guard] FAILED — ggvibe/ is missing required files"
  exit 1
fi

echo "[guard] Root is clean. Building from ggvibe/ only."
