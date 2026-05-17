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

# App code
COPY src/ ./src/
COPY config/ ./config/
COPY main.py .

# Static frontend from web stage
COPY --from=web /web/dist /app/web/dist

# Persisted dirs (mounted volumes recommended)
RUN mkdir -p /app/transcripts /app/models

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD curl -fsS http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "src.pipeline.server:app", "--host", "0.0.0.0", "--port", "8000"]
