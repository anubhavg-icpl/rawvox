<p align="center">
  <img src="https://img.shields.io/badge/UNCENSORED-RAWVOX-red?style=for-the-badge&labelColor=black" alt="rawvox badge">
  <br>
  <strong>Uncensored AI ASR + Deep Internet Search + Seductive Voice Output</strong>
  <br>
  <em>Speak. Search. Hear. No filters. No censorship. No limits.</em>
</p>

---

## What is RawVox?

RawVox is an end-to-end, fully uncensored AI pipeline that lets you:

1. **Speak** into your microphone — real-time transcription via faster-whisper (large-v3)
2. **Search** the deep internet — multi-engine aggregation (DuckDuckGo, Brave, Mojeek, SearXNG) with deep page crawling, no safesearch, no content filtering
3. **Extract & Synthesize** — semantic ranking via sentence-transformers pulls the most relevant facts from crawled pages
4. **Hear the answer** — spoken back to you in a seductive voice via Kokoro-82M (HuggingFace's #1 TTS model with 9.7M downloads)

Nothing is filtered at any stage. No content moderation. No censorship. Raw.

---

## Architecture

```
  🎤 Microphone
      │
      ▼
  ┌──────────────────────┐
  │   faster-whisper      │  Real-time ASR transcription
  │   large-v3 (int8)     │  No VAD filter, no content filtering
  └──────────┬───────────┘
             │ text
             ▼
  ┌──────────────────────┐
  │  Uncensored Search    │  Multi-engine: DuckDuckGo, Brave,
  │  Deep Web Crawler     │  Mojeek, SearXNG (safesearch=OFF)
  │  (async httpx)        │  Deep crawls top results, extracts
  └──────────┬───────────┘  full page content (up to 50K chars)
             │ search results
             ▼
  ┌──────────────────────┐
  │  Content Extractor    │  sentence-transformers semantic ranking
  │  & Synthesizer        │  Chunks text, ranks by relevance,
  │  (all-MiniLM-L6-v2)   │  synthesizes top facts into answer
  └──────────┬───────────┘
             │ synthesized answer
             ▼
  ┌──────────────────────┐
  │  Kokoro-82M TTS       │  #1 HuggingFace TTS model
  │  af_bella (A-grade)   │  Warm, sultry, seductive voice
  │  speed=0.8 (slower)   │  Fallback: edge-tts, macOS say, XTTS-v2
  └──────────┬───────────┘
             │
             ▼
  🔊 Voice Output + 💾 Transcript (JSON)
```

---

## Features

### Real-Time ASR
- **faster-whisper** with large-v3 model — best accuracy available
- Auto-detects language or force a specific one
- No voice activity detection filter — captures everything
- Word-level timestamps for precision
- Supports live mic input or audio file transcription

### Uncensored Deep Web Search
- **4 search engines** aggregated simultaneously: DuckDuckGo, Brave, Mojeek, SearXNG
- **safesearch=OFF** on every engine — no content filtering
- **Deep crawling** — fetches full HTML content from top results (up to 50,000 chars per page)
- Intelligent text extraction — strips scripts, nav, footers; targets article/main content
- URL deduplication across engines
- Async httpx for fast parallel requests
- Custom User-Agent and header rotation to avoid blocks

### Content Extraction & Synthesis
- **sentence-transformers** (`all-MiniLM-L6-v2`) for semantic chunk ranking
- Text chunking into 512-char segments
- Cosine similarity scoring against your query
- Top 15 most relevant facts extracted and synthesized
- Confidence scoring on every answer
- Source attribution with engine, title, and URL

### Seductive Voice Output (TTS)
- **Kokoro-82M** — HuggingFace's #1 TTS model (9.7M downloads, Apache 2.0 license)
- **`af_bella`** (A-grade) — warm, sultry, highest quality female voice
- **`af_heart`** (A-grade) — intimate, emotional, heartfelt whispers
- **`af_nicole`** (B-grade) — close intimate mic, ASMR-like, headphones recommended
- **`af_aoede`** — breathy, soft, gentle whispering
- **`af_sarah`** — smooth, confident, natural warmth
- **`bf_emma`** — British, sophisticated, elegant seduction
- Speed control — 0.8x default (slower = more sensual)
- Auto-detects best available backend: Kokoro → edge-tts → macOS say → Coqui XTTS-v2
- Voice cloning support via Coqui XTTS-v2 (pass any `speaker_wav` file)

### CLI Interface
- `rawvox live` — real-time mic → search → voice response (continuous loop)
- `rawvox query "your text"` — direct text query with rich formatted output
- `rawvox file audio.wav` — transcribe audio file → search → respond
- `rawvox search "topic"` — deep search only (no ASR/TTS)
- Beautiful terminal output via Rich (tables, panels, colors)

### FastAPI Server
- `POST /search` — text query → synthesized answer with sources
- `POST /transcribe` — upload audio file → transcription
- `POST /transcribe-and-search` — upload audio → transcribe → search → answer
- `GET /health` — health check
- Auto-documented with OpenAPI/Swagger

### Transcript Logging
- Every query + answer saved as JSON in `./transcripts/`
- Includes query, answer, sources, confidence score, timestamp
- Full search history for review

---

## Quick Start

### Prerequisites
- Python 3.11 or 3.12
- A microphone (for live mode)
- ~2GB disk space for models

### Installation

```bash
# Clone the repo
git clone git@github.com:anubhavg-icpl/rawvox.git
cd rawvox

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Activate the virtual environment
source venv/bin/activate
```

Or manually:

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install --no-user -r requirements.txt
pip install --no-user https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
```

### Usage

```bash
# Real-time mode: speak into mic, get voice answers back
python main.py live

# Direct text query
python main.py query "what are the best open source AI models"

# Transcribe an audio file and search its content
python main.py file recording.wav

# Deep search only (no mic, no voice)
python main.py search "uncensored AI models 2024"

# Start the API server
python src/pipeline/server.py
```

### Docker

```bash
# Full deployment with SearXNG sidecar + GPU support
docker-compose up -d

# Or build and run manually
docker build -t rawvox .
docker run -p 8000:8000 rawvox
```

---

## Configuration

All settings live in `config/settings.yaml`. Key options:

### ASR Settings
```yaml
asr:
  model: "large-v3"       # faster-whisper model size
  device: "auto"           # auto-detect CUDA/CPU
  compute_type: "int8"     # quantization for speed
  language: null           # null = auto-detect
  vad_filter: false        # OFF = no filtering (uncensored)
```

### Search Settings
```yaml
search:
  searxng_url: "http://localhost:8888"   # Self-hosted SearXNG
  engines:
    - duckduckgo
    - brave
    - mojeek
    - qwant
  max_results: 20
  max_depth: 3              # Pages to deep-crawl
  safesearch: 0             # OFF (uncensored)
```

### Voice Settings
```yaml
tts:
  backend: "auto"           # auto-detect best available
  voice: "af_bella"         # Kokoro A-grade sultry voice
  speed: 0.8                # 0.8 = slower, more sensual
  # Alternative voices:
  #   af_heart  - intimate, emotional
  #   af_nicole - close mic, ASMR
  #   af_aoede  - breathy whisper
  #   bf_emma   - British sophisticated
```

---

## Voice Options

### Kokoro Voices (Primary — Best Quality)

| Voice | Grade | Style | Best For |
|-------|-------|-------|----------|
| `af_bella` | **A** | Warm, sultry, highest quality | Default seductive output |
| `af_heart` | **A** | Intimate, emotional, heartfelt | Personal, whispered responses |
| `af_nicole` | **B-** | Close mic, ASMR-like | Headphone listening, intimacy |
| `af_aoede` | **C+** | Breathy, soft, gentle | Soft spoken answers |
| `af_sarah` | **C+** | Smooth, confident, warm | Professional but alluring |
| `af_kore` | **C+** | Clear, warm, pleasant | Conversational |
| `bf_emma` | **B-** | British, sophisticated | Elegant, cultured responses |
| `bf_isabella` | **C** | British, refined | Cultured allure |

### Edge-TTS Voices (Fallback)

| Voice | Style |
|-------|-------|
| `en-US-AriaNeural` | Warm, intimate, smooth |
| `en-US-MichelleNeural` | Husky, deep, confident |
| `en-US-AnaNeural` | Velvety, sultry |
| `en-GB-SoniaNeural` | British sophisticated |
| `en-IE-EmilyNeural` | Irish, melodic, enchanting |

### Voice Cloning (GPU Required)
Pass any audio file as `speaker_wav` in the config to clone that voice using Coqui XTTS-v2.

---

## Project Structure

```
rawvox/
├── main.py                    # CLI entry point (click)
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container build
├── docker-compose.yml         # Full deployment (with SearXNG)
├── config/
│   └── settings.yaml          # All configuration
├── src/
│   ├── asr/
│   │   └── engine.py          # Real-time ASR (faster-whisper)
│   ├── search/
│   │   └── engine.py          # Uncensored deep search (multi-engine)
│   ├── extractor/
│   │   └── engine.py          # Content extraction & synthesis
│   ├── tts/
│   │   └── engine.py          # Seductive TTS (Kokoro/edge-tts/XTTS-v2)
│   └── pipeline/
│       ├── orchestrator.py    # End-to-end pipeline coordinator
│       └── server.py          # FastAPI HTTP server
├── tests/
│   └── test_search.py         # Search module test
├── scripts/
│   └── setup.sh               # Quick start setup script
└── transcripts/               # Auto-saved query transcripts (JSON)
```

---

## API Reference

### `POST /search`
Search with a text query. Returns synthesized answer with sources.

```json
{
  "query": "your search text",
  "deep": true,
  "speak": false
}
```

Response:
```json
{
  "query": "your search text",
  "answer": "Synthesized answer from multiple sources...",
  "sources": [
    {"title": "...", "url": "...", "engine": "duckduckgo"}
  ],
  "confidence": 0.72
}
```

### `POST /transcribe`
Upload an audio file for transcription.

```bash
curl -X POST -F "file=@audio.wav" http://localhost:8000/transcribe
```

### `POST /transcribe-and-search`
Upload audio → transcribe → deep search → return synthesized answer.

```bash
curl -X POST -F "file=@audio.wav" http://localhost:8000/transcribe-and-search
```

### `GET /health`
```json
{"status": "ok", "service": "uncensored-asr-search"}
```

---

## Open Source Dependencies

| Library | Purpose | License |
|---------|---------|---------|
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Real-time ASR transcription | MIT |
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | #1 TTS model, seductive voices | Apache 2.0 |
| [sentence-transformers](https://huggingface.co/sentence-transformers) | Semantic content ranking | Apache 2.0 |
| [edge-tts](https://github.com/rany2/edge-tts) | Microsoft neural TTS fallback | GPL-3.0 |
| [httpx](https://github.com/encode/httpx) | Async HTTP client | BSD-3 |
| [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) | HTML parsing | MIT |
| [FastAPI](https://github.com/tiangolo/fastapi) | HTTP API server | MIT |
| [SearXNG](https://github.com/searxng/searxng) | Self-hosted uncensored metasearch | AGPL-3.0 |

---

## How It Works (End-to-End Flow)

### Live Mode (`python main.py live`)

1. **Mic captures audio** at 16kHz via sounddevice, buffered in 5-second chunks
2. **faster-whisper large-v3** transcribes each chunk in real-time with word timestamps
3. **Silence detection** — after 2 seconds of silence, the accumulated text is finalized as a query
4. **Query is sent to the search engine** — all configured engines fire in parallel:
   - DuckDuckGo HTML search (no API key needed, safesearch off)
   - Brave search (safesearch off)
   - Mojeek (privacy-focused, no censorship)
   - SearXNG (if running locally, aggregates 70+ engines)
5. **Results are deduplicated** by URL, sorted by rank
6. **Top 3 results are deep-crawled** — full HTML fetched, stripped to text content (up to 50K chars each)
7. **Content is chunked** into 512-char segments
8. **sentence-transformers** encodes the query and all chunks, computes cosine similarity
9. **Top 15 most relevant chunks** are synthesized into a coherent answer
10. **Kokoro-82M** with `af_bella` voice generates audio at 0.8x speed (slow, sultry)
11. **Audio plays** through your speakers via sounddevice
12. **Transcript saved** as JSON with query, answer, sources, confidence, timestamp
13. **Loop continues** — mic stays active, listening for your next query

### Query Mode (`python main.py query "text"`)

Same pipeline as above, but skips ASR — takes text input directly, outputs rich formatted table + synthesized answer.

### Search Mode (`python main.py search "topic"`)

Search only — no ASR, no TTS. Displays results in a Rich table with engine, title, URL, snippet, and content availability.

---

## Why Uncensored?

Most AI systems apply content filtering at multiple stages:
- ASR models that refuse to transcribe "sensitive" audio
- Search engines that enforce safesearch by default
- Content extractors that skip "adult" or "controversial" pages
- TTS systems that refuse to speak certain text

RawVox disables all of these filters. It's designed for:
- **Researchers** who need unfiltered access to information
- **Security professionals** who need to analyze any content
- **Journalists** who need to search without algorithmic bias
- **Anyone** who believes in unrestricted access to information

---

## License

This project is provided as-is for educational and research purposes. Individual components have their own licenses (see table above).

---

<p align="center">
  <strong>RawVox</strong> — Speak freely. Search deeply. Hear everything.
</p>
