#!/usr/bin/env bash
set -e

echo "========================================="
echo "  Uncensored AI ASR + Deep Search Setup"
echo "========================================="

# Create virtual environment
echo "[1/4] Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "[2/4] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create directories
echo "[3/4] Creating directories..."
mkdir -p transcripts audio_samples

echo "[4/4] Setup complete!"
echo ""
echo "Usage:"
echo "  source venv/bin/activate"
echo "  python main.py live              # Real-time mic → search → response"
echo "  python main.py query 'your text' # Direct text query"
echo "  python main.py file audio.wav    # Transcribe file → search"
echo "  python main.py search 'topic'    # Deep search only"
echo "  python src/pipeline/server.py    # Start API server"
echo ""
echo "  docker-compose up -d             # Docker deployment"
