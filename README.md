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


## Gallery — Generated Images

All images generated from uncensored prompts, converted to AVIF (75% smaller than JPEG). 16:9 at 1376x768.

### Brand & Logo

<p align="center">
  <img src="assets/crimson_soundwave_morphs_into_lips.avif" alt="Crimson soundwave morphs into lips" width="100%">
</p>

<p align="center">
  <img src="assets/rawvox_logo_formed_cables.avif" alt="RAWVOX logo formed from cables" width="100%">
</p>

<p align="center">
  <img src="assets/command_center_with_holographic.avif" alt="Command center with holographic globe" width="100%">
</p>

<p align="center">
  <img src="assets/rawvox_text_with_waveform_lines.avif" alt="RAWVOX text with waveform lines" width="100%">
</p>

### Hero / Cinematic

<p align="center">
  <img src="assets/woman_on_skyscraper_rooftop_night.avif" alt="Woman on skyscraper rooftop at night" width="100%">
</p>

<p align="center">
  <img src="assets/woman_walking_in_server_farm.avif" alt="Woman walking in server farm" width="100%">
</p>

<p align="center">
  <img src="assets/lips_speaking_into_microphone_wa.avif" alt="Lips speaking into microphone waterfall" width="100%">
</p>

### Dark Cyberpunk / Tech-noir

<p align="center">
  <img src="assets/figure_in_neon-lit_alley.avif" alt="Figure in neon-lit alley UNCENSORED" width="100%">
</p>

<p align="center">
  <img src="assets/concrete_monolith_tower_loudspea.avif" alt="Concrete monolith tower with loudspeakers" width="100%">
</p>

<p align="center">
  <img src="assets/woman_face_cybernetic_implant.avif" alt="Woman face cybernetic implant" width="100%">
</p>

### Soundwave & Audio Visualization

<p align="center">
  <img src="assets/soundwave_visualization_text_cha.avif" alt="Soundwave visualization from text characters" width="100%">
</p>

<p align="center">
  <img src="assets/ocean_ripples_form_audio_waveform.avif" alt="Ocean ripples form audio waveform" width="100%">
</p>

<p align="center">
  <img src="assets/vinyl_record_spinning_on_turntable.avif" alt="Vinyl record with micro-engraved text" width="100%">
</p>

<p align="center">
  <img src="assets/crimson_audio_waveform_on_black.avif" alt="Crimson audio waveform on black" width="100%">
</p>

### Seductive AI / Woman + Technology

<p align="center">
  <img src="assets/woman_manipulating_holographic_data.avif" alt="Woman manipulating holographic data" width="100%">
</p>

<p align="center">
  <img src="assets/woman_emerging_from_cables.avif" alt="Woman emerging from fiber optic cables" width="100%">
</p>

<p align="center">
  <img src="assets/woman_recording_in_studio_booth.avif" alt="Woman recording in studio booth" width="100%">
</p>

<p align="center">
  <img src="assets/woman_walking_in_light_corridor.avif" alt="Woman walking in red light corridor" width="100%">
</p>

<p align="center">
  <img src="assets/woman_with_glowing_red_waveform.avif" alt="Woman with glowing red waveform halo" width="100%">
</p>

<p align="center">
  <img src="assets/woman_in_room_with_screens.avif" alt="Woman in room surrounded by screens" width="100%">
</p>

### Dark Abstract / Conceptual

<p align="center">
  <img src="assets/geometric_structure_audio_wavefo.avif" alt="Impossible geometric waveform structure" width="100%">
</p>

<p align="center">
  <img src="assets/woman_touching_orbs_in_library.avif" alt="Library of audio orbs" width="100%">
</p>

<p align="center">
  <img src="assets/masterpiece_best_quality_dark_conceptual.avif" alt="Text figure in desert" width="100%">
</p>

<p align="center">
  <img src="assets/black_hole_absorbing_information.avif" alt="Black hole absorbing information" width="100%">
</p>

### Terminal / Hacker Aesthetic

<p align="center">
  <img src="assets/woman_in_data_storm.avif" alt="Wall of terminals with data storm" width="100%">
</p>

<p align="center">
  <img src="assets/eye_reflecting_scrolling_termina.avif" alt="Eye reflecting scrolling terminal" width="100%">
</p>

<p align="center">
  <img src="assets/heartbeat_monitor_screen_showing.avif" alt="Heartbeat monitor showing search results" width="100%">
</p>

### Artistic / Unique

<p align="center">
  <img src="assets/lips_soundwave_line_drawing.avif" alt="Lips soundwave line drawing minimalist" width="100%">
</p>

<p align="center">
  <img src="assets/ink_dropped_on_paper_waveform.avif" alt="Ink dropped on paper forming waveform" width="100%">
</p>

<p align="center">
  <img src="assets/human_eye_with_audio_waveform.avif" alt="Human eye with audio waveform iris" width="100%">
</p>

<p align="center">
  <img src="assets/woman_back_with_tattoo.avif" alt="Woman back with search result tattoo" width="100%">
</p>

<p align="center">
  <img src="assets/woman_face_reflected_shattered.avif" alt="Face reflected in shattered mirror shards" width="100%">
</p>

### Epic / Fantasy

<p align="center">
  <img src="assets/woman_on_throne_of_monitors.avif" alt="Dark queen on throne of monitors" width="100%">
</p>

<p align="center">
  <img src="assets/canyon_shaped_like_audio_waveform.avif" alt="Canyon shaped like audio waveform" width="100%">
</p>

<p align="center">
  <img src="assets/woman_holding_glowing_microphone.avif" alt="Woman holding glowing microphone as weapon" width="100%">
</p>

<p align="center">
  <img src="assets/woman_underwater_in_data_center.avif" alt="Woman underwater in data center" width="100%">
</p>

<p align="center">
  <img src="assets/woman_walking_in_waveform_garden.avif" alt="Woman walking in digital waveform garden" width="100%">
</p>

<p align="center">
  <img src="assets/woman_speaking_into_microphone_s.avif" alt="Voice as physical shockwave force" width="100%">
</p>

### Banner / Social

<p align="center">
  <img src="assets/monolith_with_glowing_red_text.avif" alt="Monolith with glowing red text" width="100%">
</p>

<p align="center">
  <img src="assets/web_pages_network_constellation.avif" alt="Web pages as constellation network" width="100%">
</p>

---

## Image Generation Prompts

All 40 images above were generated from these uncensored prompts. Copy-paste into Flux, SDXL, Midjourney (`--ar 16:9`), or DALL-E.

<details>
<summary><strong>Click to expand all 40 prompts</strong></summary>

**Prompt 1 — Crimson Soundwave Morphs into Lips**
```
masterpiece, best quality, ultra detailed, 16:9 cinematic wide shot, a glowing crimson red soundwave waveform pulsating against a deep obsidian black void, the waveform slowly morphs into the silhouette of a womans lips mid-whisper, neon crimson and electric magenta light trails spiral outward from the lips, holographic data particles floating in the air, the word RAWVOX carved from dark brushed chrome metal with deep red backlight, volumetric fog, anamorphic lens flare, 8K, Octane Render
```

**Prompt 2 — RAWVOX Logo Formed from Cables**
```
masterpiece, best quality, hyperdetailed 16:9, the word RAWVOX formed from hundreds of tangled black audio cables and fiber optic strands glowing hot red and deep violet, the letters cracked and fractured with white light bleeding through, thin smoke wisps rising, dark background with subtle hexagonal grid, sparks jumping between strands, dramatic rim lighting, shot on ARRI Alexa 65, anamorphic lens, film grain, 8K
```

**Prompt 3 — Command Center with Holographic Globe**
```
masterpiece, best quality, ultra detailed 16:9, dark futuristic command center with walls covered in scrolling search results in green terminal font, massive holographic sphere displaying rotating earth with red data streams connecting cities, sleek microphone on black glass pedestal under crimson spotlight, reflective black marble floor, Blade Runner 2049 color palette, volumetric god rays, Unreal Engine 5, 8K
```

**Prompt 4 — Woman on Skyscraper Rooftop**
```
masterpiece, best quality, photorealistic 16:9, woman from behind at edge of glass skyscraper rooftop at night in heavy rain, black leather jacket, long dark wet hair blowing, vintage chrome microphone connected by glowing red cable dropping into void, city skyline with neon signs in Japanese and English, SEARCH DEEP HEAR EVERYTHING projected onto storm clouds, noir atmosphere, RED Monstro 8K, anamorphic bokeh, 8K
```

**Prompt 5 — Woman Walking in Server Farm**
```
masterpiece, best quality, ultra detailed 16:9, vast underground server farm stretching to infinity, rows of black server racks with blinking red and blue LEDs, single pathway lit by red LED strips, woman in flowing black silk dress walking barefoot trailing fingers along servers, glowing data streams floating like aurora borealis, cables hanging like vines from ceiling, cyberpunk meets gothic cathedral, ultra wide angle, HDR, 8K
```

**Prompt 6 — Figure in Neon-lit Alley**
```
masterpiece, best quality, ultra detailed 16:9, dark narrow alley in rain-drenched neon cyberpunk city, holographic advertisements showing search results, mysterious figure in long black coat under massive red neon sign reading UNCENSORED, rain creating rivers of neon light on wet asphalt, steam from manhole covers, red waveform projected on brick wall, Blade Runner 2049 aesthetic, IMAX 70mm, chromatic aberration, 8K
```

**Prompt 7 — Concrete Monolith Tower**
```
masterpiece, best quality, photorealistic 16:9, massive brutalist concrete tower rising from dark landscape, facade covered with giant loudspeakers pumping visible sound waves through rain, search queries streaming across surface in red LED text, tiny human silhouettes at base for scale, oppressive awe-inspiring atmosphere, Beksinski meets Cyberpunk 2077, dramatic stormy sky with lightning, drone perspective, 8K
```

**Prompt 8 — Woman Face Cybernetic Implant**
```
masterpiece, best quality, hyperdetailed 16:9, womans face extreme close-up profile view, pale porcelain skin with dark chrome cybernetic implants along jawline glowing faint red, eye reflects waterfall of scrolling text and search results, finger to lips in silencing gesture, other hand releases glowing crimson waveforms spiraling outward, matrix falling characters in background, editorial fashion, Rembrandt lighting, Phase One IQ4, 8K
```

**Prompt 9 — Soundwave Visualization from Text**
```
masterpiece, best quality, abstract 16:9, massive 3D soundwave frozen in dark void, waveform constructed from thousands of densely packed glowing text characters and search queries, wave crests glow white-hot through orange to crimson to purple to black in troughs, incandescent particles breaking free from peaks floating upward like embers, waveform spans entire frame, Octane Render with global illumination, 8K
```

**Prompt 10 — Ocean Ripples Audio Waveform**
```
masterpiece, best quality, ultra detailed 16:9, aerial top-down view of vast dark ocean at midnight, glassy still surface with perfect concentric ripples radiating from center point, each ripple glows crimson red bioluminescent light, ripples form clear audio waveform pattern with varying spacing, luminous red particles floating above water, single vintage microphone half-submerged at center creating ripples, long exposure, drone shot, 8K
```

**Prompt 11 — Vinyl Record with Micro-engraved Text**
```
masterpiece, best quality, hyperdetailed 16:9, extreme macro of black vinyl spinning on aluminium turntable, grooves contain impossibly tiny micro-engraved text of search queries and transcriptions, tonearm needle sending up red and gold sparks, vinyl surface reflects distorted web pages, warm Edison bulb desk lamp lighting, red LED underglow on turntable base, vintage analog meets digital, Hasselblad X2D macro, 8K
```

**Prompt 12 — Woman Manipulating Holographic Data**
```
masterpiece, best quality, photorealistic 16:9, woman sitting cross-legged in dark room eyes closed in concentration, seven floating holographic screens in semicircle showing search results spectrograms and transcribed text, fingers tracing through air manipulating data leaving red light trails, dark turtleneck with red LED threads at collar, lips slightly parted, screens cast red and blue light across face, large waveform screen behind like halo, editorial Rembrandt lighting, 8K
```

**Prompt 13 — Woman Emerging from Cables**
```
masterpiece, best quality, ultra detailed 16:9, woman emerging from dense cocoon of black fiber optic cables and red audio wires wrapping her body as avant-garde dress, cables pulse with bright red light traveling along length creating fire-like effect, one hand raised holding glowing crimson orb projecting 3D holographic waveform around wrist, confident seductive half-smile with direct eye contact, other hand beckoning forward, Alexander McQueen meets Neuralink, Phase One IQ4, 8K
```

**Prompt 14 — Woman Recording in Studio**
```
masterpiece, best quality, hyperrealistic 16:9, woman in professional recording studio booth leaning into Neumann U87 condenser microphone, eyes half-closed sultry dreamy expression, one hand gently cupping microphone mesh, other hand on bare thigh, studio headphones pushed back off one ear revealing delicate ear with red gem earring, warm amber studio lighting with red LED accent strips, soundproofing panels behind, shallow depth of field, film grain, 8K
```

**Prompt 15 — Woman Walking in Light Corridor**
```
masterpiece, best quality, cinematic 16:9, tall woman in infinite corridor made entirely of vertical light beams in shades of crimson and scarlet, walking toward camera with confident purpose, each beam contains dense scrolling text and search queries, her movement creates ripples in the beams like walking through water, dark hair and lightweight black clothing fluttering in wind, corridor vanishes to white light behind her, mysterious seductive expression, ARRI Alexa LF anamorphic, 8K
```

**Prompt 16 — Geometric Waveform Structure**
```
masterpiece, best quality, abstract 16:9, impossible M.C. Escher-like geometric structure made of twisted 3D audio waveforms and floating typographic text, floating in black void illuminated by single red point light, waveforms interlock forming hollow sphere simultaneously collapsing and expanding, broken text fragments orbit like asteroid belt, mathematical precision meets organic chaos, Zaha Hadid parametric meets cyberpunk, Cinema 4D Octane Render, volumetric lighting, 8K
```

**Prompt 17 — Library of Audio Orbs**
```
masterpiece, best quality, surreal 16:9, infinite library where every book replaced by floating luminous crimson orb containing swirling audio waveforms and text data, millions of orbs fill towering shelves stretching into dark ceiling-less void, woman in dark flowing dress walks through aisles trailing fingers through orbs causing them to burst into waterfalls of glowing red text forming temporary sentences before dissolving, warm amber and crimson light contrasting cold blue shadows, Rene Magritte meets Shadow of the Colossus, volumetric god rays, 8K
```

**Prompt 18 — Text Figure in Desert**
```
masterpiece, best quality, dark conceptual 16:9, humanoid figure standing alone in vast empty desert made entirely of compressed search result text constantly shifting and rearranging, some words glow red hot like embers others fade invisible, arms raised to blood-red sky releasing massive double helix of crimson audio waveforms spiraling into clouds, sand made of millions of shattered glass text characters sparkling in red light, dramatic chiaroscuro, Andreas Gursky scale, 8K
```

**Prompt 19 — Wall of Terminals**
```
masterpiece, best quality, ultra detailed 16:9, entire wall of dark room covered floor to ceiling with glowing terminal windows showing scrolling search results crawling output and transcription text in green on black, woman in modern black chair at center illuminated only by mixed red green amber screen light, calm focused face with confident smile, fingers hovering over mechanical keyboard, thick cables running across floor like roots, screens curve onto ceiling creating dome of information, hacker meets cathedral, 8K
```

**Prompt 20 — Eye Reflecting Terminal**
```
masterpiece, best quality, photorealistic 16:9, extreme close-up of computer screen in dark room showing terminal with green text on black displaying raw search results HTTP headers and extracted content, green text reflects perfectly in extreme close-up of persons eye filling entire iris with mirrored scrolling output, only eye and nose bridge visible lit by green monitor glow, rest of face in pure black shadow, microphone catches faint green glint, CRT curvature distortion in reflection, Hasselblad macro, 8K
```

**Prompt 21 — Heartbeat Monitor**
```
masterpiece, best quality, minimalist 16:9, medical heartbeat monitor screen showing flat green line spiking into dramatic waveform when detecting audio, but waveform peaks filled with densely packed red text of search results and transcriptions instead of normal ECG pattern, monitor is only light source in pitch black hospital room, green glow illuminates dust particles, text clearly readable showing real search queries, single womans hand reaches from darkness touching glass where waveform peaks, contact point glows brighter red, shallow depth of field, 8K
```

**Prompt 22 — Lips Soundwave Line Drawing**
```
masterpiece, best quality, clean minimalist 16:9, pure white background, stylized icon of lips with smooth soundwave emanating outward rendered as single continuous flowing line drawing in deep crimson red ink, line varies from thick bold at lips thinning to hairline at wave tips, soundwave at extremities morphs into individual text characters and search query fragments scattering into white space, only red line on white paper no fills no shadows, Noma Bar meets Paul Rand editorial illustration, crisp vector-sharp edges, 8K
```

**Prompt 23 — Ink Drop Waveform**
```
masterpiece, best quality, abstract 16:9, top-down view of crimson red ink dropped onto pure white paper spreading outward in perfect concentric audio waveform rings, each ring contains micro-printed text of search results legible at this scale, ink splatter frozen mid-expansion, some rings thick and bold others hairline thin, tiny ink droplets splashed beyond main rings creating satellite patterns, small vintage microphone visible at center origin point, high-end abstract art photography, Phase One overhead shot, 8K
```

**Prompt 24 — Human Eye with Waveform Iris**
```
masterpiece, best quality, hyperrealistic 16:9, extreme macro of single human eye filling entire frame, iris composed of intricate concentric audio waveform rings in shades of crimson and amber, each ring contains impossibly tiny micro-text of search results, pupil is infinite black void, cornea reflects tiny woman speaking into microphone, visible blood vessels in sclera, individual eyelashes in sharp focus with bokeh falloff at edges, visible skin texture and imperfections, single key light creating catchlight in waveform iris, 5x magnification macro, 8K
```

**Prompt 25 — Woman Back with Tattoo**
```
masterpiece, best quality, photorealistic 16:9, close-up of womans bare back showing enormous detailed tattoo from shoulders to waist, tattoo is audio waveforms search queries transcribed text and waveform visualizations in deep red and black ink, central design is large waveform following spine with search text filling wave patterns, smaller waveforms branch across shoulder blades, photorealistic tattoo artistry with visible ink dots and shading, single warm light from above and behind, natural skin sheen with visible texture, high fashion editorial meets tattoo photography, 8K
```

**Prompt 26 — Shattered Mirror Reflections**
```
masterpiece, best quality, hyperrealistic 16:9, womans face reflected in hundreds of shattered mirror shards scattered across dark surface, each shard reflects different web page search result or extracted text fragment instead of her face, shards arranged in rough oval where mirror was broken, reflections glow red and amber from web pages, some show DuckDuckGo others Brave others article content, cracks between shards emit faint red glow, real face invisible only data reflections, dark moody editorial conceptual photography, 8K
```

**Prompt 27 — Dark Queen on Throne**
```
masterpiece, best quality, hyperrealistic 16:9, woman seated on enormous throne of stacked CRT monitors keyboards tangled cables and server blades all glowing red and amber, one leg crossed over other relaxed confident, left hand on server rack arm with blinking lights, right hand holds sleek microphone like scepter, dark structured haute couture gown with fiber optic threads glowing red along seams, massive semicircular monitor wall behind displays mosaic of search results as halo, commanding serene slightly dangerous expression with red light in eyes, Game of Thrones meets Hackers meets Alexander McQueen, 8K
```

**Prompt 28 — Waveform Canyon**
```
masterpiece, best quality, ultra detailed 16:9, massive geological canyon where rock formations shaped exactly like giant audio waveform, canyon walls rise and fall in perfect waveform amplitude patterns stretching to horizon, rock surface covered in engraved text of search queries like ancient petroglyphs, single river of glowing red light flows through valley floor, tiny woman figure stands on peak with arms outstretched, dramatic golden hour lighting with long shadows, red river glowing from below, landscape photography meets data visualization meets Monument Valley, extreme depth and scale, 8K
```

**Prompt 29 — Glowing Microphone as Weapon**
```
masterpiece, best quality, cinematic 16:9, woman in dark alley at night holding vintage chrome microphone above head like weapon about to strike, thick red cable trailing behind into darkness, microphone glowing white-hot with red energy crackling like lightning, energy touching wet brick walls burns search results and transcribed text into stone, heavy rain falling, dark hooded jacket with water streaming off, fierce determined face with red light in eyes, trails of burned text on walls behind her where she already passed, action movie poster meets cyberpunk noir, Dutch angle, high contrast rim lighting, 8K
```

**Prompt 30 — Submerged Data Center**
```
masterpiece, best quality, surreal 16:9, entire data center submerged underwater in clear crystalline water, rows of server racks beneath surface with red and blue LEDs creating mesmerizing patterns visible through water, calm water surface at top reflecting dark sky, woman floats horizontally just below surface arms outstretched eyes closed peacefully, long dark hair fans out in water like dark halo, visible sound waves ripple through water as concentric circles of light distortion, tiny air bubbles carrying text fragments rise from servers, caustic light patterns on server racks, Jacques Cousteau meets The Matrix, 8K
```

**Prompt 31 — Digital Waveform Garden**
```
masterpiece, best quality, surreal 16:9, beautiful dark garden at night where every plant is audio waveforms and every leaf is transcribed text fragment, tall waveform trees with trunks of twisted red light, ground covered in scrolling green terminal text, woman in dark flowing gown walks on path of glowing red stepping stones each displaying different search query, floating pollen-like particles are extracted web content drifting on warm wind, some waveform plants pulse and sway as if breathing, bioluminescent red and blue light creates fairy-tale atmosphere, Alice in Wonderland meets digital art, volumetric fog and god rays, 8K
```

**Prompt 32 — Voice as Physical Force**
```
masterpiece, best quality, cinematic 16:9, woman in dark industrial warehouse speaking into microphone, voice manifests as visible physical shockwave of pure red energy expanding outward in perfect hemisphere shattering everything in path, glass windows exploding outward with frozen shards catching red light, papers and documents flying through air in slow motion trailing red glow, visible sound wave distorts air creating heat-haze ripples, hair and clothing blown backward by force of own voice, microphone glows white-hot from energy, dramatic action photography at moment of maximum impact, dark warehouse with exposed brick and steel, 1/8000s freeze, 8K
```

**Prompt 33 — Black Hole Absorbing Information**
```
masterpiece, best quality, ultra detailed 16:9, massive black hole in deep space absorbing information instead of light, millions of web pages search results text documents and audio waveforms pulled into event horizon in dramatic spiraling accretion disk of glowing red and orange data, data stretches and distorts approaching singularity, at center where nothing should escape brilliant white light emits pure spoken word text radiating outward in perfect concentric waveforms, womans face subtly visible in center light as source of voice, cosmic scale fills frame with stars, Interstellar aesthetic, volumetric light rendering, 8K
```

**Prompt 34 — Crimson Waveform on Black**
```
masterpiece, best quality, minimalist 16:9, pure absolute black background with zero texture, single continuous perfect crimson red audio waveform line horizontally across exact center of frame, perfectly smooth with one dramatic sharp peak at center, beneath waveform line centered horizontally in small clean white Helvetica text reads speak freely search deeply hear everything, soft red glow aura bleeding into surrounding blackness, extreme minimalism, Swiss International Typographic Style meets dark web aesthetic, razor-sharp vector edges, 8K
```

**Prompt 35 — Web Pages as Constellation**
```
masterpiece, best quality, ultra detailed 16:9, vast dark space resembling night sky but light points are tiny crawled web page thumbnails connected by thin glowing red lines forming enormous 3D network constellation, bright pulsing red node at center represents users query with all lines radiating from it, varying density creating bright clustered areas and dark voids, womans face faintly visible as observer with constellation reflected in her eyes, deep space meets deep web, dark matter visualization meets search architecture, ray traced volumetric red light, 8K
```

**Prompt 36 — Woman with Waveform Halo**
```
masterpiece, best quality, photorealistic 16:9, woman standing in pitch black darkness illuminated only by massive glowing crimson circular audio waveform floating horizontally behind her head like futuristic halo, waveform ring constructed from dense text and search results glowing maroon to scarlet, face lit from behind creating dramatic silhouette with features as dark shape against red glow, subtle red wash illuminating front of face revealing confident expression with piercing eyes, high-collared dark coat catching red light on edges, tiny particles of red light floating downward like digital snow, editorial fashion meets science fiction, 8K
```

**Prompt 37 — Monolith with Red Text**
```
masterpiece, best quality, 16:9, dramatic low-angle looking up at massive black obsidian obelisk standing alone in infinite dark void, entire surface covered in glowing red scrolling text of search results transcriptions and audio waveforms cascading downward like digital rain, red text reflects perfectly in glossy mirror-dark floor extending effect downward, RAWVOX carved into upper face emitting intense white light, ominous powerful awe-inspiring, 2001 Space Odyssey monolith meets cyberpunk, wide angle upward perspective distortion, ray traced reflections, volumetric red light, 8K
```

**Prompt 38 — Woman in Data Storm**
```
masterpiece, best quality, cinematic 16:9, woman standing completely still in middle of empty dark street at night while thousands of web pages search results and text documents rain down from above like violent storm, pages semi-transparent and glowing red as they fall swirling around her in wind, looking directly upward into data storm with serene accepting expression and arms slightly open, pages accumulate in drifts at her feet like snow, wet street reflecting red glow from above, dark abandoned storefronts on both sides, long exposure motion blur on falling pages, 8K
```

**Prompt 39 — Woman Speaking with Shockwave**
```
masterpiece, best quality, cinematic 16:9, woman speaking into vintage microphone creating visible red energy shockwave expanding outward, the shockwave is made of compressed text and search results that scatter outward from her, she wears dark flowing dress that billows in the energy wave, her hair streams backward, behind her a dark cityscape with the shockwave rippling through buildings leaving burned text on surfaces, dramatic action moment frozen in time, Dutch angle, red and black color palette, high contrast, motion blur on debris, 8K
```

**Prompt 40 — RAWVOX Text Waveform Banner**
```
masterpiece, best quality, ultra detailed 16:9 banner, dark gradient from deep black left to dark crimson red right, word RAWVOX dominates center in bold condensed industrial sans-serif, each letter constructed from stacked horizontal audio waveform lines pulsing with varying amplitude creating visual heartbeat rhythm, subtle red particle effects floating like embers, faint ethereal silhouette of womans face profile on right side barely visible in red gradient, her visible breath forms waveform connecting into R of RAWVOX, cinematic premium, GitHub social preview banner format, 8K
```

</details>

---

## Prompt Tips for Best Results

| Tip | Detail |
|-----|--------|
| **Aspect Ratio** | Use `--ar 16:9` for Midjourney, `1344x768` or `1920x1088` for Stable Diffusion/Flux |
| **Quality Boosters** | Start with `masterpiece, best quality, ultra detailed` for SD, `photorealistic, 8K, ARRI Alexa` for realistic |
| **Negative Prompt** | `lowres, bad anatomy, bad hands, text error, missing fingers, extra digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark` |
| **Color Palette** | Red/crimson/black — use `crimson, deep red, neon red, dark chrome, obsidian black` |
| **Style Mixing** | `cyberpunk` + `film noir` + `editorial photography` = signature RawVox look |
| **Models** | Flux.1-dev, Stable Diffusion XL, Midjourney v6, or Pony Diffusion |
| **Upscaling** | Real-ESRGAN or Topaz after generation for print/web quality |

## License

This project is provided as-is for educational and research purposes. Individual components have their own licenses (see table above).

---

<p align="center">
  <strong>RawVox</strong> — Speak freely. Search deeply. Hear everything.
</p>
