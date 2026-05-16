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

## 16:9 Image Generation Prompts

These prompts are designed for 16:9 aspect ratio (1920x1080, 1344x768, or 1216x832 depending on your model). Copy-paste them into Stable Diffusion, Flux, Midjourney (use `--ar 16:9`), DALL-E, or any image generation model. All prompts are fully uncensored — no content restrictions applied.

### Brand & Logo Prompts

```
masterpiece, best quality, ultra detailed, 16:9 cinematic wide shot, a glowing red soundwave waveform pulsating against a deep black void, the waveform morphs into the silhouette of a woman's lips mid-whisper, neon crimson and electric magenta light trails, holographic particles floating, typography "RAWVOX" in sharp angular sans-serif font carved from dark chrome metal with red backlight bleeding through the letterforms, volumetric fog, anamorphic lens flare, dark moody atmosphere, 8K resolution, photorealistic rendering
```

```
masterpiece, best quality, hyperdetailed 16:9 cinematic logo reveal, the word "RAWVOX" formed from hundreds of tangled audio cables and fiber optic strands glowing hot red and deep violet, the letters are cracked and broken with pure white light bleeding through the fractures, smoke rising from the surface, dark atmospheric background with subtle grid pattern, particle effects, dramatic rim lighting, shot on ARRI Alexa, shallow depth of field, film grain
```

```
masterpiece, best quality, ultra detailed 16:9 wide shot, a dark futuristic command center with walls covered in scrolling search results and transcribed text in green terminal font, a massive holographic sphere in the center displaying a rotating earth with red data streams connecting continents, a sleek microphone stands on a pedestal illuminated by a single crimson spotlight, moody cyberpunk aesthetic, Blade Runner color palette, volumetric lighting, ray traced reflections on wet floor, Unreal Engine 5 render quality
```

### Hero / Landing Page Banner Prompts

```
masterpiece, best quality, photorealistic 16:9 cinematic wide shot, a woman seen from behind standing at the edge of a skyscraper rooftop at night, she is wearing a sleek black leather jacket, her long dark hair blowing in wind, she is speaking into a vintage retro microphone connected by a glowing red cable that drops into the infinite digital abyss below the building, the city skyline stretches to the horizon with neon signs in Japanese and English, rain falling, reflections on wet glass, the words "SEARCH DEEP. HEAR EVERYTHING." projected in light onto the clouds above, moody noir atmosphere, shot on RED Monstro 8K, anamorphic bokeh
```

```
masterpiece, best quality, ultra detailed 16:9 panoramic shot, interior of a vast underground server farm stretching into infinity, rows of server racks as far as the eye can see with blinking red and blue LEDs, a single pathway lit by red strip lights cutting through the center, a woman in a flowing black dress walking barefoot down the path trailing her fingers along the servers, glowing data streams floating in the air around her like aurora borealis, cables hanging from the ceiling like vines, cyberpunk meets gothic cathedral aesthetic, dramatic perspective, ultra wide angle lens, HDR, ray tracing
```

```
masterpiece, best quality, hyperrealistic 16:9 wide shot, split screen composition — left half shows a close-up of lips speaking into a studio condenser microphone in warm golden light, right half shows an infinite cascading waterfall of search results, web pages, and extracted text fragments falling through a dark digital void, the two halves merge in the center where the sound waves from the microphone visually transform into the falling text, dramatic contrast between warm organic left side and cold digital right side, cinematic color grading, shallow depth of field, 8K
```

### Dark Cyberpunk / Tech-noir Prompts

```
masterpiece, best quality, ultra detailed 16:9, cyberpunk noir scene, a dark alley in a rain-soaked neon city, holographic advertisements floating in the air showing search results and transcribed conversations, a figure in a long black coat standing under a red neon sign that reads "UNCENSORED", the rain creates rivers of light on the wet asphalt reflecting neon pinks and blues, steam rising from manhole covers, a glowing red waveform is projected onto the brick wall behind the figure, Blade Runner 2049 aesthetic, shot on IMAX, volumetric fog, film noir lighting, chromatic aberration, detail max
```

```
masterpiece, best quality, photorealistic 16:9, extreme wide shot of a brutalist concrete megastructure in a dystopian future, the building has giant speakers mounted on its facade pumping out visible sound waves that ripple through the rain, the sky is dark with storm clouds lit from below by the city's neon glow, search queries stream across the building's surface in giant red LED text, tiny human silhouettes stand at the base for scale, oppressive atmosphere, Zdzislaw Beksinski meets Cyberpunk 2077, ultra detailed architectural rendering, dramatic stormy sky, 8K resolution
```

```
masterpiece, best quality, hyperdetailed 16:9, a woman's face in extreme close-up profile view, her skin is pale with subtle cybernetic implants glowing faintly red along her jawline, her eye reflects a waterfall of scrolling text and search results, one hand holds a finger to her lips in a "shhh" gesture, the other hand extends forward releasing a stream of glowing red audio waveforms that spiral outward, dark background with subtle matrix-style falling green characters, editorial fashion photography style, Rembrandt lighting, Phase One IQ4 150MP detail level
```

### Soundwave & Audio Visualization Prompts

```
masterpiece, best quality, abstract 16:9, a massive three-dimensional soundwave visualization frozen in time, the waveform is constructed from thousands of tiny glowing text characters and search results packed tightly together, the wave crests glow hot red and orange while the troughs are deep purple and black, the waveform fills the entire frame from left to right, tiny particles of light break off from the peaks and float upward like embers, dark void background, rendered in Octane Render, ultra high detail, 8K, shallow depth of field focusing on the center peak
```

```
masterpiece, best quality, ultra detailed 16:9, top-down aerial view of a vast dark ocean at midnight, the water surface is perfectly still except for concentric ripples radiating outward from a single point, each ripple glows with red bioluminescent light, the ripples form a waveform pattern when viewed from above, tiny particles of light float above the water surface, a single vintage microphone is barely visible at the center point creating the ripples, ethereal atmospheric mood, long exposure photography aesthetic, Drone shot, 8K resolution, serene yet ominous
```

```
masterpiece, best quality, hyperdetailed 16:9, macro extreme close-up of a vinyl record playing on a turntable, but the grooves in the vinyl contain tiny micro-engraved text of search queries and transcribed speech, the needle tracks through the grooves sending up sparks of red and gold light, the reflections on the vinyl surface show distorted glimpses of web pages and search results, warm ambient lighting from a nearby desk lamp, shallow depth of field, vintage analog meets digital aesthetic, shot on Hasselblad X2D, cream color palette with red accents
```

### Woman + Technology / Seductive AI Prompts

```
masterpiece, best quality, photorealistic 16:9 cinematic shot, a woman sitting cross-legged in a dark room, her eyes closed in deep concentration, floating holographic screens surround her in a semi-circle showing search results, spectrograms, and transcribed text, her fingers trace through the air manipulating the floating data, she wears dark clothing with subtle red LED accents at the collar and cuffs, her lips are slightly parted as if mid-sentence, the screens cast red and blue light across her face, one screen behind her shows a large glowing waveform, mysterious and powerful atmosphere, editorial photography, Rembrandt lighting, 8K
```

```
masterpiece, best quality, ultra detailed 16:9, a woman emerging from a cocoon of fiber optic cables and audio wires, the cables wrap around her body like a dress, they pulse with red light traveling along their length, she has one hand raised holding a small glowing orb that projects a holographic waveform, her expression is confident and alluring with a slight knowing smile, the cables extend behind her into darkness, she is stepping forward out of the light, cyberpunk high fashion aesthetic, Alexander McQueen meets Neuralink, dramatic backlighting, smoke machine, shot on Phase One, 8K
```

```
masterpiece, best quality, hyperrealistic 16:9 portrait, woman in a recording studio, she is leaning into a large condenser microphone with her eyes half-closed, speaking softly, one hand cups the microphone, the other rests on her thigh, she wears over-ear studio headphones pushed slightly back, warm amber recording studio lighting mixed with red LED accent lights, soundproofing panels on the walls behind her, the microphone reflects the warm light, intimate and sensual atmosphere, editorial music photography, shallow depth of field, film grain, 8K resolution, photorealistic skin detail
```

```
masterpiece, best quality, cinematic 16:9, a woman standing in a corridor made entirely of vertical light beams in varying shades of red and crimson, she is walking toward the camera with purpose, each light beam contains scrolling text visible when viewed closely, her movement creates ripples in the light beams like parting water, her hair and clothing flutter in an unseen wind, the corridor stretches to a vanishing point behind her bathed in white light, mysterious and seductive expression, high fashion editorial aesthetic, shot on ARRI Alexa LF, anamorphic lens, lens flares, 8K
```

### Dark Abstract / Conceptual Prompts

```
masterpiece, best quality, abstract 16:9, an impossible geometric structure made of twisted audio waveforms and typographic elements, the structure floats in a dark void illuminated by a single red point light source, the waveforms form a sphere that is simultaneously collapsing and expanding, fragments of broken text orbit around it like asteroid belts, some text fragments glow red while others are barely visible in shadow, mathematical precision meets organic chaos, M.C. Escher meets Zaha Hadid meets cyberpunk, rendered in Cinema 4D with Octane Render, volumetric lighting, ultra detailed, 8K
```

```
masterpiece, best quality, surreal 16:9, a library where every book has been replaced by a floating orb of light containing compressed audio waveforms, the orbs fill infinite towering shelves that stretch into a dark ceiling-less void, a single figure walks through the aisles trailing her hand through the orbs causing them to burst into cascading waterfalls of glowing text, the text forms temporary sentences before dissolving, warm amber light from the orbs contrasts with cold blue shadows, dreamlike atmosphere, Rene Magritte meets Team Ico, volumetric god rays, 8K
```

```
masterpiece, best quality, dark conceptual 16:9, a humanoid figure made entirely of compressed text and search results standing in a vast empty desert under a blood-red sky, the text that forms the figure's body constantly shifts and rearranges, some words glow red hot while others fade to invisible, the figure has its arms raised to the sky releasing a torrent of audio waveforms that spiral upward like a double helix, the sand at its feet is made of tiny shattered glass characters, dramatic chiaroscuro lighting, conceptual art photography, Andreas Gursky scale, 8K resolution
```

### Terminal / Hacker / Code Aesthetic Prompts

```
masterpiece, best quality, ultra detailed 16:9, an entire wall of a dark room covered floor to ceiling in glowing terminal windows showing scrolling search results, crawling output, and real-time transcription text, a woman sits in a chair in the center of the room illuminated only by the red and green light from the screens, her face is calm and focused, her fingers hover over a keyboard, cables run from the monitors across the floor like roots, the screens extend beyond the walls curving up onto the ceiling, every screen shows different search engines and results, hacker aesthetic meets cathedral of information, dramatic lighting, 8K
```

```
masterpiece, best quality, photorealistic 16:9, extreme close-up of a computer screen in a dark room, the screen shows a terminal with green text on black background displaying raw search results and extracted content, the text reflects in the eyes of a person sitting close to the monitor, only their eyes and bridge of nose visible in the green reflected light, the rest of their face is in deep shadow, the screen's glow also reflects on a condenser microphone positioned to their left, intimate late-night coding atmosphere, nostalgia meets cyberpunk, CRT screen curvature effect, 8K
```

### Minimalist / Clean Prompts

```
masterpiece, best quality, minimalist 16:9, pure black background, a single continuous red audio waveform line drawn horizontally across the exact center of the frame, the line is perfectly smooth with one dramatic peak in the center where it spikes upward and then back down, beneath the line in small clean white sans-serif text reads "speak freely. search deeply. hear everything.", the waveform line has a subtle red glow/aura effect, extreme minimalism, Swiss design meets dark web aesthetic, vector-sharp edges, 8K resolution
```

```
masterpiece, best quality, clean 16:9, pure white background, a stylized icon of lips with a soundwave emanating from them, the lips and soundwave are rendered in a single continuous line drawing in deep crimson red, the line varies in weight from thick at the lips to hairline thin at the wave tips, the soundwave morphs into text characters at its extremities, minimal and elegant, negative space is the hero, editorial illustration style, Noma Bar meets Paul Rand, 8K, crisp vector edges
```

### Banner / Social Media Prompts

```
masterpiece, best quality, ultra detailed 16:9 banner, dark gradient background transitioning from deep black on the left to dark crimson red on the right, a large stylized "RAWVOX" text in the center in bold condensed sans-serif font, the letters are made of stacked horizontal audio waveform lines that pulse with varying intensity, subtle particle effects floating around the text, a faint silhouette of a woman's profile in the background on the right side, her breath visibly forming the waveform that becomes the text, cinematic and premium, suitable for GitHub social preview banner, 8K resolution
```

```
masterpiece, best quality, 16:9 social media banner, a dramatic low-angle shot looking up at a massive monolithic black obelisk standing alone in a dark void, the surface of the obelisk is covered in glowing red scrolling text — search results, transcriptions, audio waveforms — cascading down its surface like digital rain, the text reflects in the glossy dark floor extending the effect downward, the word "RAWVOX" is carved into the top of the obelisk emitting white light, ominous and powerful, 2001 Space Odyssey meets cyberpunk, 8K, ray traced reflections
```

---

## Prompt Tips for Best Results

| Tip | Detail |
|-----|--------|
| **Aspect Ratio** | Use `--ar 16:9` for Midjourney, set resolution to `1344x768` or `1920x1088` for Stable Diffusion/Flux |
| **Quality Boosters** | Start with `masterpiece, best quality, ultra detailed` for anime/SD models, or `photorealistic, 8K, shot on ARRI Alexa` for realistic |
| **Negative Prompt** | `lowres, bad anatomy, bad hands, text error, missing fingers, extra digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark` |
| **Color Control** | Red/crimson/black is the RawVox palette — use `crimson, deep red, neon red, dark chrome, obsidian black` |
| **Style Mixing** | Combine `cyberpunk` + `film noir` + `editorial photography` for the signature RawVox look |
| **Model Recommendations** | Flux.1-dev, Stable Diffusion XL, Midjourney v6, or Pony Diffusion for best results |
| **Upscaling** | Generate at base resolution then upscale with Real-ESRGAN or Topaz for print/web quality |

---

## License

This project is provided as-is for educational and research purposes. Individual components have their own licenses (see table above).

---

<p align="center">
  <strong>RawVox</strong> — Speak freely. Search deeply. Hear everything.
</p>
