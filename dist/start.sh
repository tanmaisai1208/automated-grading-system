#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Automated Grading System — Linux Startup Script
#  Place this script beside the `grading-system` binary.
# ─────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Gemini API key (hardcoded — replace with your actual key)
export GEMINI_API_KEY="GOOGLE_API_KEY"

# Port (change if 5000 is taken)
export PORT="${PORT:-5000}"

# Node env — tells Express to use same-origin mode (no CORS)
export NODE_ENV="production"

# Data directory is resolved inside the binary relative to process.execPath
# (paths.js handles this automatically — no need to set DATA_DIR here)

echo "──────────────────────────────────────────"
echo "  Automated Grading System"
echo "  http://localhost:${PORT}"
echo "──────────────────────────────────────────"

exec "$SCRIPT_DIR/grading-system"
