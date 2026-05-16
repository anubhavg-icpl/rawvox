<div align="center">

<img src="assets/crimson_soundwave_morphs_into_lips.avif" alt="RawVox — Uncensored AI ASR + Deep Search" width="100%">

[![Uncensored](https://img.shields.io/badge/UNCENSORED-RAWVOX-red?style=for-the-badge&labelColor=black)]()
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)]()
[![HuggingFace](https://img.shields.io/badge/TTS-Kokoro%20%231-yellow?style=flat-square)]()

# RawVox

### Uncensored AI ASR · Deep Internet Search · Seductive Voice Output

**Speak. Search deep. Hear everything. No filters. No censorship. No limits.**

[Get Started](#quick-start) · [Architecture](#architecture) · [Gallery](#gallery) · [API](#api-reference)

</div>

---

<img src="assets/woman_on_skyscraper_rooftop_night.avif" alt="Hero" width="100%">

---

## What It Does

RawVox is a fully uncensored, end-to-end AI voice pipeline:

| Stage | What Happens | Tech |
|-------|-------------|------|
| **1. Speak** | Talk into your mic — real-time transcription | faster-whisper large-v3 |
| **2. Search** | Deep internet search across 4 engines, safesearch OFF | DuckDuckGo, Brave, Mojeek, SearXNG |
| **3. Extract** | Semantic ranking pulls the most relevant facts | sentence-transformers |
| **4. Hear** | Answer spoken back in a seductive voice | Kokoro-82M (HuggingFace #1 TTS) |

Every stage is unfiltered. No content moderation. No censorship. Raw.

---

## Architecture

<img src="assets/command_center_with_holographic.avif" alt="Architecture — Command Center" width="100%">

```
  🎤 Microphone
      │
      ▼
  ┌──────────────────────┐
  │   faster-whisper      │  Real-time ASR, no VAD filter
  │   large-v3 (int8)     │  No content filtering
  └──────────┬───────────┘
             │ transcribed text
             ▼
  ┌──────────────────────┐
  │  Uncensored Search    │  4 engines in parallel
  │  Deep Web Crawler     │  safesearch=OFF on all
  │  (async httpx)        │  Deep-crawls up to 50K chars/page
  └──────────┬───────────┘
             │ search results
             ▼
  ┌──────────────────────┐
  │  Content Extractor    │  Semantic chunk ranking
  │  & Synthesizer        │  Cosine similarity scoring
  │  (all-MiniLM-L6-v2)   │  Top 15 facts synthesized
  └──────────┬───────────┘
             │ synthesized answer
             ▼
  ┌──────────────────────┐
  │  Kokoro-82M TTS       │  #1 HF TTS model (9.7M downloads)
  │  af_bella (A-grade)   │  Warm, sultry, seductive voice
  │  speed=0.8 (slower)   │  Fallback: edge-tts, macOS say, XTTS-v2
  └──────────┬───────────┘
             │
             ▼
  🔊 Voice Output + 💾 Transcript (JSON)
```

---

## Quick Start

### Prerequisites

- Python 3.11 or 3.12
- A microphone (for live mode)
- ~2GB disk space for models

### Install

```bash
git clone git@github.com:anubhavg-icpl/rawvox.git
cd rawvox
chmod +x scripts/setup.sh && ./scripts/setup.sh
source venv/bin/activate
```

Or manually:

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install --no-user -r requirements.txt
pip install --no-user https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
```

### Run

```bash
# Speak into mic — get voiced answers back
python main.py live

# Direct text query
python main.py query "what are the best uncensored open source AI models"

# Transcribe audio file → search → respond
python main.py file recording.wav

# Deep search only (no mic, no voice)
python main.py search "uncensored AI models 2024"

# Start the API server
python src/pipeline/server.py
```

### Docker

```bash
docker-compose up -d    # Full stack with SearXNG + GPU
```

---

## Real-Time ASR

<img src="assets/woman_face_cybernetic_implant.avif" alt="ASR — Cybernetic Interface" width="100%">

- **faster-whisper large-v3** — highest accuracy available
- Auto-detects language or force a specific one
- **No VAD filter** — captures everything, no filtering
- Word-level timestamps for precision
- Live mic input or audio file transcription
- Configurable model size: `tiny` → `large-v3`

---

## Uncensored Deep Web Search

<img src="assets/figure_in_neon-lit_alley.avif" alt="Search — Uncensored Alley" width="100%">

4 search engines aggregated simultaneously with **safesearch disabled** on every single one:

| Engine | Type | Notes |
|--------|------|-------|
| **DuckDuckGo** | HTML scrape | No API key needed |
| **Brave** | HTML scrape | Privacy-focused |
| **Mojeek** | HTML scrape | Independent index |
| **SearXNG** | Self-hosted | Aggregates 70+ engines |

- **Deep crawling** — fetches full HTML from top results (up to 50,000 chars per page)
- URL deduplication across all engines
- Async parallel requests via httpx
- Custom User-Agent and header rotation to avoid blocks

---

## Content Extraction & Synthesis

<img src="assets/woman_touching_orbs_in_library.avif" alt="Extraction — Library of Knowledge" width="100%">

- **sentence-transformers** (`all-MiniLM-L6-v2`) for semantic chunk ranking
- Text chunking into 512-char segments
- Cosine similarity scoring against your query
- Top 15 most relevant facts extracted and synthesized
- Confidence scoring on every answer
- Full source attribution with engine, title, and URL

---

## Seductive Voice Output

<img src="assets/woman_recording_in_studio_booth.avif" alt="TTS — Studio Recording" width="100%">

<div align="center">

| Voice | Grade | Style |
|-------|-------|-------|
| `af_bella` **(default)** | **A** | Warm, sultry, highest quality |
| `af_heart` | **A** | Intimate, emotional, heartfelt whispers |
| `af_nicole` | **B-** | Close mic, ASMR-like, use headphones |
| `af_aoede` | **C+** | Breathy, soft, gentle whispering |
| `af_sarah` | **C+** | Smooth, confident, natural warmth |
| `bf_emma` | **B-** | British, sophisticated, elegant |

</div>

- **Kokoro-82M** — HuggingFace #1 TTS (9.7M downloads, Apache 2.0)
- Speed control — 0.8x default (slower = more sensual)
- Auto-detects best backend: Kokoro → edge-tts → macOS say → XTTS-v2
- Voice cloning via Coqui XTTS-v2 (pass any `speaker_wav` file)

<details>
<summary>Edge-TTS fallback voices</summary>

| Voice | Style |
|-------|-------|
| `en-US-AriaNeural` | Warm, intimate, smooth |
| `en-US-MichelleNeural` | Husky, deep, confident |
| `en-US-AnaNeural` | Velvety, sultry |
| `en-GB-SoniaNeural` | British sophisticated |
| `en-IE-EmilyNeural` | Irish, melodic, enchanting |

</details>

---

## CLI Reference

```bash
python main.py live                # Real-time mic → search → voice (loop)
python main.py query "text"        # Direct text query
python main.py file audio.wav      # Transcribe file → search → respond
python main.py search "topic"      # Deep search only
```

Rich terminal output with tables, panels, and colors.

---

## API Reference

<img src="assets/woman_in_room_with_screens.avif" alt="API — Data Screens" width="100%">

Start the server:

```bash
python src/pipeline/server.py    # http://localhost:8000
```

### `POST /search`

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "uncensored AI models", "deep": true}'
```

Response:

```json
{
  "query": "uncensored AI models",
  "answer": "Synthesized from multiple sources...",
  "sources": [{"title": "...", "url": "...", "engine": "duckduckgo"}],
  "confidence": 0.72
}
```

### `POST /transcribe`

```bash
curl -X POST -F "file=@audio.wav" http://localhost:8000/transcribe
```

### `POST /transcribe-and-search`

```bash
curl -X POST -F "file=@audio.wav" http://localhost:8000/transcribe-and-search
```

### `GET /health`

```json
{"status": "ok", "service": "uncensored-asr-search"}
```

---

## Configuration

All settings in `config/settings.yaml`:

```yaml
asr:
  model: "large-v3"       # faster-whisper model size
  device: "auto"           # auto-detect CUDA/CPU
  vad_filter: false        # OFF = uncensored

search:
  engines: [duckduckgo, brave, mojeek, qwant]
  max_results: 20
  max_depth: 3             # Pages to deep-crawl
  safesearch: 0            # OFF

tts:
  voice: "af_bella"        # Kokoro A-grade
  speed: 0.8               # Slower = more sensual
```

---

## Project Structure

```
rawvox/
├── main.py                    # CLI entry point
├── requirements.txt           # Dependencies
├── Dockerfile                 # Container build
├── docker-compose.yml         # Full deployment
├── config/
│   └── settings.yaml          # All configuration
├── src/
│   ├── asr/engine.py          # Real-time ASR
│   ├── search/engine.py       # Uncensored deep search
│   ├── extractor/engine.py    # Content extraction
│   ├── tts/engine.py          # Seductive TTS
│   └── pipeline/
│       ├── orchestrator.py    # E2E pipeline
│       └── server.py          # FastAPI server
├── assets/                    # AVIF images (gallery)
├── tests/
│   └── test_search.py
├── scripts/
│   └── setup.sh
└── transcripts/               # Auto-saved JSON transcripts
```

---

## End-to-End Flow

<img src="assets/rawvox_logo_formed_cables.avif" alt="E2E Flow" width="100%">

### Live Mode (`python main.py live`)

1. **Mic captures audio** at 16kHz via sounddevice, buffered in 5-second chunks
2. **faster-whisper large-v3** transcribes in real-time with word timestamps
3. **Silence detection** — 2 seconds of silence finalizes the query
4. **All engines fire in parallel** — DuckDuckGo, Brave, Mojeek, SearXNG
5. **Results deduplicated** by URL, sorted by rank
6. **Top 3 results deep-crawled** — full HTML extracted (up to 50K chars each)
7. **Content chunked** into 512-char segments
8. **sentence-transformers** encodes and ranks by cosine similarity
9. **Top 15 chunks** synthesized into a coherent answer
10. **Kokoro-82M af_bella** generates audio at 0.8x speed (slow, sultry)
11. **Audio plays** through your speakers via sounddevice
12. **Transcript saved** as JSON with query, answer, sources, confidence
13. **Loop continues** — mic stays active for your next query

---

## Why Uncensored?

<img src="assets/concrete_monolith_tower_loudspea.avif" alt="Why Uncensored — Speaker Tower" width="100%">

Most AI systems filter at every stage:
- ASR models that refuse to transcribe "sensitive" audio
- Search engines that enforce safesearch by default
- Content extractors that skip "controversial" pages
- TTS systems that refuse to speak certain text

RawVox disables **all** of these filters. Built for:

- **Researchers** who need unfiltered access to information
- **Security professionals** who need to analyze any content
- **Journalists** who need to search without algorithmic bias
- **Anyone** who believes in unrestricted access to information

---

## Gallery

All 40 images generated from uncensored prompts. AVIF format (75% smaller than JPEG). 16:9 at 1376×768.

<img src="assets/rawvox_text_with_waveform_lines.avif" alt="RAWVOX banner" width="100%">

<table>
<tr>
<td width="50%"><img src="assets/crimson_audio_waveform_on_black.avif" alt="Crimson waveform" width="100%"></td>
<td width="50%"><img src="assets/lips_soundwave_line_drawing.avif" alt="Lips line drawing" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/soundwave_visualization_text_cha.avif" alt="Text soundwave" width="100%"></td>
<td width="50%"><img src="assets/ocean_ripples_form_audio_waveform.avif" alt="Ocean ripples" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/vinyl_record_spinning_on_turntable.avif" alt="Vinyl record" width="100%"></td>
<td width="50%"><img src="assets/geometric_structure_audio_wavefo.avif" alt="Geometric structure" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/ink_dropped_on_paper_waveform.avif" alt="Ink waveform" width="100%"></td>
<td width="50%"><img src="assets/heartbeat_monitor_screen_showing.avif" alt="Heartbeat monitor" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/black_hole_absorbing_information.avif" alt="Black hole" width="100%"></td>
<td width="50%"><img src="assets/masterpiece_best_quality_dark_conceptual.avif" alt="Desert text figure" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/web_pages_network_constellation.avif" alt="Web constellation" width="100%"></td>
<td width="50%"><img src="assets/human_eye_with_audio_waveform.avif" alt="Eye waveform" width="100%"></td>
</tr>
</table>

<img src="assets/woman_walking_in_server_farm.avif" alt="Server farm" width="100%">

<table>
<tr>
<td width="50%"><img src="assets/woman_manipulating_holographic_data.avif" alt="Holographic data" width="100%"></td>
<td width="50%"><img src="assets/woman_emerging_from_cables.avif" alt="Emerging cables" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/woman_walking_in_light_corridor.avif" alt="Light corridor" width="100%"></td>
<td width="50%"><img src="assets/woman_with_glowing_red_waveform.avif" alt="Waveform halo" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/woman_on_throne_of_monitors.avif" alt="Data throne" width="100%"></td>
<td width="50%"><img src="assets/woman_holding_glowing_microphone.avif" alt="Microphone weapon" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/woman_underwater_in_data_center.avif" alt="Underwater data center" width="100%"></td>
<td width="50%"><img src="assets/woman_walking_in_waveform_garden.avif" alt="Waveform garden" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/woman_speaking_into_microphone_s.avif" alt="Shockwave voice" width="100%"></td>
<td width="50%"><img src="assets/woman_in_data_storm.avif" alt="Data storm" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/woman_back_with_tattoo.avif" alt="Search tattoo" width="100%"></td>
<td width="50%"><img src="assets/woman_face_reflected_shattered.avif" alt="Shattered mirror" width="100%"></td>
</tr>
</table>

<img src="assets/lips_speaking_into_microphone_wa.avif" alt="Lips to text waterfall" width="100%">

<table>
<tr>
<td width="50%"><img src="assets/eye_reflecting_scrolling_termina.avif" alt="Terminal eye" width="100%"></td>
<td width="50%"><img src="assets/canyon_shaped_like_audio_waveform.avif" alt="Waveform canyon" width="100%"></td>
</tr>
<tr>
<td width="50%"><img src="assets/monolith_with_glowing_red_text.avif" alt="Obelisk monolith" width="100%"></td>
<td width="50%"><img src="assets/woman_in_room_with_screens.avif" alt="Screen room" width="100%"></td>
</tr>
</table>

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

### Prompt Tips

| Tip | Detail |
|-----|--------|
| **Aspect Ratio** | `--ar 16:9` (Midjourney), `1344x768` (SDXL/Flux) |
| **Quality** | `masterpiece, best quality, ultra detailed` for SD; `photorealistic, 8K, ARRI Alexa` for realistic |
| **Negative** | `lowres, bad anatomy, bad hands, text error, missing fingers, extra digits, cropped, worst quality, low quality, jpeg artifacts, watermark` |
| **Palette** | `crimson, deep red, neon red, dark chrome, obsidian black` |
| **Style** | `cyberpunk` + `film noir` + `editorial photography` |
| **Models** | Flux.1-dev, SDXL, Midjourney v6, Pony Diffusion |

---

## Open Source Dependencies

| Library | Purpose | License |
|---------|---------|---------|
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Real-time ASR | MIT |
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | #1 TTS model | Apache 2.0 |
| [sentence-transformers](https://huggingface.co/sentence-transformers) | Semantic ranking | Apache 2.0 |
| [edge-tts](https://github.com/rany2/edge-tts) | Neural TTS fallback | GPL-3.0 |
| [httpx](https://github.com/encode/httpx) | Async HTTP | BSD-3 |
| [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) | HTML parsing | MIT |
| [FastAPI](https://github.com/tiangolo/fastapi) | API server | MIT |
| [SearXNG](https://github.com/searxng/searxng) | Uncensored metasearch | AGPL-3.0 |

---

<div align="center">

<img src="assets/monolith_with_glowing_red_text.avif" alt="RawVox" width="100%">

**RawVox** — Speak freely. Search deeply. Hear everything.

</div>
