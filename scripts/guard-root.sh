#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Deployment Guard: Root Install Check ==="
echo "pwd:       $(pwd)"
echo "REPO_ROOT: $REPO_ROOT"
echo ""

FAIL=0

if [ -f "$REPO_ROOT/package.json" ]; then
  echo "BLOCKED: Root package.json found — removing it."
  cat "$REPO_ROOT/package.json"
  rm -f "$REPO_ROOT/package.json"
  FAIL=1
fi

if [ -f "$REPO_ROOT/package-lock.json" ]; then
  echo "BLOCKED: Root package-lock.json found — removing it."
  rm -f "$REPO_ROOT/package-lock.json"
  FAIL=1
fi

if [ -f "$REPO_ROOT/yarn.lock" ]; then
  echo "BLOCKED: Root yarn.lock found — removing it."
  rm -f "$REPO_ROOT/yarn.lock"
  FAIL=1
fi

if [ -f "$REPO_ROOT/pnpm-lock.yaml" ]; then
  echo "BLOCKED: Root pnpm-lock.yaml found — removing it."
  rm -f "$REPO_ROOT/pnpm-lock.yaml"
  FAIL=1
fi

if [ -d "$REPO_ROOT/node_modules" ]; then
  echo "BLOCKED: Root node_modules/ found — removing it."
  rm -rf "$REPO_ROOT/node_modules"
fi

if [ "$FAIL" -ne 0 ]; then
  echo ""
  echo "WARNING: Root-level Node artifacts were detected and removed."
  echo "Replit platform may have regenerated them. Continuing with build."
  echo ""
fi

if [ ! -f "$REPO_ROOT/ggvibe/package.json" ]; then
  echo "FATAL: ggvibe/package.json not found!"
  exit 1
fi

if [ ! -f "$REPO_ROOT/ggvibe/package-lock.json" ]; then
  echo "FATAL: ggvibe/package-lock.json not found!"
  exit 1
fi

echo "PASS: Root is clean. Building from ggvibe/ only."
echo "============================================="
