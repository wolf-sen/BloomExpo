#!/usr/bin/env bash
set -euo pipefail
echo "=============="
echo "Starting Bloom"
echo "Version 0.1a"
echo "=============="

# run from the script's directory (repo root)
cd "$(dirname "$0")"

# fetch latest updates on 'main'
BRANCH="main"
echo "Updating BloomExpo (branch: $BRANCH)..."
git fetch --prune origin
git reset --hard "origin/$BRANCH"

echo "Starting Visuals"
# change to the command you want, e.g. "node run dev" or "npm run dev"
cd Visuals
echo "npm run dev"
