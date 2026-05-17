# syntax=docker/dockerfile:1.7
# ==============================================================
# RawVox — multi-stage build
#   1. node:20  → builds web/dist (Vite + React + three.js)
#   2. python  → installs requirements + serves API + static
# ==============================================================

# ---------- stage 1: web ----------
FROM node:20-alpine AS web

WORKDIR /web

# Enable pnpm via corepack, pinned to match the local lockfile.
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Install deps first (cache layer)
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy source + AVIF assets (needed by Gallery symlink)
COPY web/ ./
COPY assets/ /assets/

# Replace symlink with real assets dir so build picks them up
RUN rm -rf public/assets && cp -r /assets public/assets

# Build
RUN pnpm build


# ---------- stage 2: runtime ----------
FROM python:3.11-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps for whisper / audio / pyaudio fallback
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        portaudio19-dev \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# spaCy model used by Kokoro G2P — must be downloaded after spaCy is
# installed; it is not a regular PyPI package.
RUN python -m spacy download en_core_web_sm

# App code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY config/ ./config/
COPY main.py .

# Pre-warm the TTS + extractor models into the image-local HF cache so
# the first /api/tts and /api/search calls don't pay a download tax.
# Whisper models are kept on the runtime volume (see compose), since
# users may pick large-v3 (~3 GB) or base (140 MB).
#
# HF_TOKEN passed via build arg lifts the unauthenticated HF Hub rate
# limit and speeds up downloads. Optional — empty token still works.
ARG HF_TOKEN=""
ENV HF_HOME=/app/.cache/hf \
    TRANSFORMERS_CACHE=/app/.cache/hf \
    HF_HUB_DISABLE_TELEMETRY=1 \
    HF_TOKEN=$HF_TOKEN \
    HUGGING_FACE_HUB_TOKEN=$HF_TOKEN
RUN mkdir -p /app/.cache/hf && \
    python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')" && \
    python -c "from kokoro import KPipeline; KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')" && \
    python -c "from kokoro import KPipeline; KPipeline(lang_code='b', repo_id='hexgrad/Kokoro-82M')"

# Static frontend from web stage
COPY --from=web /web/dist /app/web/dist

# Generate per-voice .wav samples so the landing voice gallery can
# play them without the API being reachable. Falls through gracefully
# on any per-voice failure (the UI hides missing samples).
RUN mkdir -p /app/web/dist/samples && \
    python scripts/generate_voice_samples.py /app/web/dist/samples || \
    echo "[warn] some voice samples failed — landing will hide missing ones"

# Persisted dirs (mounted volumes recommended)
RUN mkdir -p /app/transcripts /app/models

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD curl -fsS http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "src.pipeline.server:app", "--host", "0.0.0.0", "--port", "8000"]
