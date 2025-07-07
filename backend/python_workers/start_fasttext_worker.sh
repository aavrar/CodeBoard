#!/bin/bash
# FastText Worker Startup Script
# Ensures Python dependencies are installed and starts the worker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[FastText Worker] Starting FastText language detection worker..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "[FastText Worker] ERROR: Python 3 is required but not found"
    exit 1
fi

# Install dependencies if needed
if ! python3 -c "import fasttext" &> /dev/null; then
    echo "[FastText Worker] Installing FastText dependencies..."
    pip3 install -r requirements.txt
fi

# Start the worker
echo "[FastText Worker] Starting FastText worker process..."
python3 fasttext_worker.py