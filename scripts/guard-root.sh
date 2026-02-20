#!/bin/bash

# This script is a safeguard to prevent accidental modifications to the root directory.

if [ "$REPL_SLUG" == "GGVIBE-LIVE-AI-ORG" ]; then
  if [ -f "/home/runner/GGVIBE-LIVE-AI-ORG/ggvibe/package.json" ]; then
    echo "Error: Root directory modification is not allowed."
    exit 1
  fi
fi
