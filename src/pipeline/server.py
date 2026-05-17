"""
FastAPI server for the RawVox pipeline.
REST + SSE + WebSocket surface for the web console.
"""

from __future__ import annotations

import asyncio
import json
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import numpy as np
import uvicorn
from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from src.pipeline.orchestrator import Pipeline


# ---------- lifespan ----------

pipeline: Pipeline | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eagerly load all models so the first user request is fast.
    Models cache to HF_HOME (mounted volume in compose) so this only
    pays a download cost on the very first boot."""
    global pipeline

    banner = (
        "\n"
        "╭───────────────────────────────────────────────╮\n"
        "│   RawVox · uncensored ASR + search + voice    │\n"
        "╰───────────────────────────────────────────────╯\n"
    )
    print(banner, flush=True)
    print("[Server] Initializing pipeline...", flush=True)
    pipeline = Pipeline()

    print("[Server] Warming up ASR (whisper)...", flush=True)
    try:
        pipeline.asr.load_model()
    except Exception as e:
        print(f"[Server] ASR warmup failed (will retry on first use): {e}", flush=True)

    print("[Server] Warming up extractor (MiniLM)...", flush=True)
    try:
        pipeline.extractor._load_model()
    except Exception as e:
        print(f"[Server] Extractor warmup failed: {e}", flush=True)

    print("[Server] Warming up TTS (kokoro)...", flush=True)
    try:
        # Detect backend without forcing kokoro if unavailable.
        backend = pipeline.tts._detect_backend()
        print(f"[Server] TTS backend: {backend}", flush=True)
        if backend == "kokoro":
            pipeline.tts._load_kokoro()
    except Exception as e:
        print(f"[Server] TTS warmup failed: {e}", flush=True)

    print("[Server] Ready · http://localhost:8000\n", flush=True)
    yield
    if pipeline:
        await pipeline.search_engine.close()
    print("[Server] Pipeline shut down", flush=True)


app = FastAPI(
    title="RawVox API",
    description="Uncensored AI ASR + Deep Search + Seductive TTS",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- schemas ----------

class SearchRequest(BaseModel):
    query: str
    deep: bool = True
    speak: bool = False
    language: str | None = None


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None
    speed: float | None = None
    format: str = Field(default="wav", pattern="^(wav|mp3)$")


class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: list[dict]
    confidence: float


# ---------- helpers ----------

def _get_pipeline() -> Pipeline:
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    return pipeline


def _sse(event: dict) -> bytes:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n".encode("utf-8")


# ---------- meta endpoints ----------

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "rawvox", "version": "1.0.0"}


@app.get("/api/config")
async def get_config():
    p = _get_pipeline()
    return {
        "asr": {
            "model": p.config.get("asr", {}).get("model"),
            "sample_rate": p.asr.sample_rate,
            "language": p.config.get("asr", {}).get("language"),
        },
        "search": {
            "engines": p.search_engine.engines,
            "max_results": p.search_engine.max_results,
            "max_depth": p.search_engine.max_depth,
            "searxng_enabled": bool(p.search_engine.searxng_url),
        },
        "tts": {
            "voice": p.tts.voice,
            "speed": p.tts.speed,
            "language": p.tts.language,
            "backend": p.tts.backend,
        },
    }


@app.get("/api/voices")
async def list_voices():
    p = _get_pipeline()
    return {"voices": p.tts.list_seductive_voices()}


@app.get("/api/engines")
async def list_engines():
    p = _get_pipeline()
    engines = [
        {"id": "duckduckgo", "name": "DuckDuckGo", "enabled": "duckduckgo" in p.search_engine.engines},
        {"id": "brave", "name": "Brave", "enabled": "brave" in p.search_engine.engines},
        {"id": "mojeek", "name": "Mojeek", "enabled": "mojeek" in p.search_engine.engines},
        {"id": "searxng", "name": "SearXNG", "enabled": bool(p.search_engine.searxng_url)},
    ]
    return {"engines": engines, "max_results": p.search_engine.max_results, "max_depth": p.search_engine.max_depth}


# ---------- search ----------

@app.post("/api/search", response_model=QueryResponse)
async def search_endpoint(req: SearchRequest):
    p = _get_pipeline()
    answer = await p.run_query(req.query, speak=req.speak)
    return QueryResponse(
        query=req.query,
        answer=answer.answer,
        sources=answer.sources,
        confidence=answer.confidence,
    )


@app.post("/api/search/stream")
async def search_stream(req: SearchRequest):
    """SSE: live engine + crawl + synth events."""
    p = _get_pipeline()

    async def gen() -> AsyncGenerator[bytes, None]:
        queue: asyncio.Queue = asyncio.Queue()

        async def on_event(evt: dict):
            await queue.put(evt)

        async def run():
            try:
                results = await p.search_engine.search_stream(req.query, deep=req.deep, on_event=on_event)
                answer = p.extractor.synthesize(req.query, results)
                # Chunk-stream the synthesized answer
                chunks = answer.answer.split("\n\n")
                for i, chunk in enumerate(chunks):
                    await queue.put({"type": "synth.chunk", "text": chunk, "idx": i, "total": len(chunks)})
                await queue.put({
                    "type": "answer",
                    "answer": answer.answer,
                    "sources": answer.sources,
                    "confidence": answer.confidence,
                })
            except Exception as e:
                await queue.put({"type": "error", "message": str(e)})
            finally:
                await queue.put(None)

        task = asyncio.create_task(run())
        try:
            yield _sse({"type": "start", "query": req.query})
            while True:
                evt = await queue.get()
                if evt is None:
                    break
                yield _sse(evt)
            yield _sse({"type": "end"})
        finally:
            task.cancel()

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ---------- transcription ----------

@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...)):
    p = _get_pipeline()
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        p.asr.load_model()
        result = p.asr.transcribe_file(tmp_path)
        if result is None:
            raise HTTPException(400, "No speech detected")
        return {
            "text": result.text,
            "language": result.language,
            "language_probability": result.language_prob,
            "words": result.words,
        }
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.post("/api/transcribe-and-search", response_model=QueryResponse)
async def transcribe_and_search(file: UploadFile = File(...)):
    p = _get_pipeline()
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        answer = await p.run_once(audio_file=tmp_path)
        if answer is None:
            raise HTTPException(400, "No speech detected or no results")
        return QueryResponse(
            query="audio_query",
            answer=answer.answer,
            sources=answer.sources,
            confidence=answer.confidence,
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)


# ---------- TTS ----------

@app.post("/api/tts")
async def tts_endpoint(req: TTSRequest):
    p = _get_pipeline()
    if req.voice:
        p.tts.voice = req.voice
    if req.speed is not None:
        p.tts.speed = req.speed

    suffix = f".{req.format}"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name

    try:
        p.tts.speak(req.text, output_path=tmp_path, play=False)
        data = Path(tmp_path).read_bytes()
        return Response(
            content=data,
            media_type=f"audio/{req.format}",
            headers={"Content-Disposition": f'inline; filename="rawvox.{req.format}"'},
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)


# ---------- transcripts ----------

@app.get("/api/transcripts")
async def list_transcripts():
    p = _get_pipeline()
    if not p.transcript_dir.exists():
        return {"transcripts": []}
    items = []
    for f in sorted(p.transcript_dir.glob("transcript_*.json"), reverse=True)[:100]:
        try:
            data = json.loads(f.read_text())
            items.append({
                "id": f.stem,
                "timestamp": data.get("timestamp"),
                "query": data.get("query", "")[:120],
                "confidence": data.get("confidence", 0.0),
            })
        except Exception:
            continue
    return {"transcripts": items}


@app.get("/api/transcripts/{tid}")
async def get_transcript(tid: str):
    p = _get_pipeline()
    f = p.transcript_dir / f"{tid}.json"
    if not f.exists():
        raise HTTPException(404, "not found")
    return json.loads(f.read_text())


# ---------- WebSocket: ASR streaming ----------

@app.websocket("/ws/asr")
async def ws_asr(ws: WebSocket):
    await ws.accept()
    p = _get_pipeline()
    p.asr.load_model()
    sr = p.asr.sample_rate
    chunk_seconds = 5
    chunk_samples = sr * chunk_seconds
    buffer = np.zeros(0, dtype=np.float32)

    try:
        while True:
            msg = await ws.receive()
            if msg.get("type") == "websocket.disconnect":
                break

            if "bytes" in msg and msg["bytes"] is not None:
                # PCM int16 little-endian → float32 [-1,1]
                pcm = np.frombuffer(msg["bytes"], dtype=np.int16).astype(np.float32) / 32768.0
                buffer = np.concatenate([buffer, pcm])
                if buffer.shape[0] >= chunk_samples:
                    audio = buffer[:chunk_samples]
                    buffer = buffer[chunk_samples:]
                    result = p.asr.transcribe_chunk(audio)
                    if result and result.text.strip():
                        await ws.send_json({
                            "type": "asr.partial",
                            "text": result.text,
                            "language": result.language,
                        })
            elif "text" in msg and msg["text"] is not None:
                try:
                    data = json.loads(msg["text"])
                except json.JSONDecodeError:
                    continue
                if data.get("type") == "stop":
                    # Flush remaining buffer
                    if buffer.shape[0] > sr:  # at least 1s
                        result = p.asr.transcribe_chunk(buffer)
                        if result and result.text.strip():
                            await ws.send_json({
                                "type": "asr.final",
                                "text": result.text,
                                "language": result.language,
                                "language_probability": result.language_prob,
                            })
                    buffer = np.zeros(0, dtype=np.float32)
                elif data.get("type") == "reset":
                    buffer = np.zeros(0, dtype=np.float32)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


# ---------- WebSocket: full pipeline ----------

@app.websocket("/ws/pipeline")
async def ws_pipeline(ws: WebSocket):
    """End-to-end stream: mic PCM in → ASR → search events → synth → tts chunks out."""
    await ws.accept()
    p = _get_pipeline()
    p.asr.load_model()
    sr = p.asr.sample_rate
    buffer = np.zeros(0, dtype=np.float32)
    silence_chunks = 0
    silence_threshold = 3  # consecutive empty transcribes = stop

    async def handle_query(query: str, voice: str | None = None, speed: float | None = None):
        await ws.send_json({"type": "asr.final", "text": query})

        async def emit(evt):
            await ws.send_json(evt)

        results = await p.search_engine.search_stream(query, deep=True, on_event=emit)
        answer = p.extractor.synthesize(query, results)
        await ws.send_json({
            "type": "answer",
            "answer": answer.answer,
            "sources": answer.sources,
            "confidence": answer.confidence,
        })

        # Apply per-request voice + speed overrides (sticky on the engine
        # for this connection — fine since each ws connection is one user).
        if voice:
            p.tts.voice = voice
        if speed is not None:
            p.tts.speed = float(speed)

        # TTS — generate, then stream base64 chunks of the audio file
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                tmp_path = tmp.name
            p.tts.speak(answer.answer[:3000], output_path=tmp_path, play=False)
            data = Path(tmp_path).read_bytes()
            Path(tmp_path).unlink(missing_ok=True)
            import base64
            CHUNK = 32 * 1024
            for i in range(0, len(data), CHUNK):
                await ws.send_json({
                    "type": "tts.chunk",
                    "audio": base64.b64encode(data[i:i + CHUNK]).decode(),
                    "format": "wav",
                    "final": i + CHUNK >= len(data),
                })
        except Exception as e:
            await ws.send_json({"type": "tts.error", "message": str(e)})

        await ws.send_json({"type": "done"})

    try:
        while True:
            msg = await ws.receive()
            if msg.get("type") == "websocket.disconnect":
                break

            if "bytes" in msg and msg["bytes"] is not None:
                pcm = np.frombuffer(msg["bytes"], dtype=np.int16).astype(np.float32) / 32768.0
                buffer = np.concatenate([buffer, pcm])

                if buffer.shape[0] >= sr * 4:
                    audio = buffer[:sr * 4]
                    buffer = buffer[sr * 4:]
                    result = p.asr.transcribe_chunk(audio)
                    if result and result.text.strip():
                        await ws.send_json({"type": "asr.partial", "text": result.text})
                        silence_chunks = 0
                    else:
                        silence_chunks += 1
            elif "text" in msg and msg["text"] is not None:
                try:
                    data = json.loads(msg["text"])
                except json.JSONDecodeError:
                    continue
                if data.get("type") == "query":
                    await handle_query(
                        data["text"],
                        voice=data.get("voice"),
                        speed=data.get("speed"),
                    )
                elif data.get("type") == "stop":
                    # Flush buffer and treat as final
                    if buffer.shape[0] > sr:
                        result = p.asr.transcribe_chunk(buffer)
                        if result and result.text.strip():
                            await handle_query(
                                result.text,
                                voice=data.get("voice"),
                                speed=data.get("speed"),
                            )
                    buffer = np.zeros(0, dtype=np.float32)
                elif data.get("type") == "reset":
                    buffer = np.zeros(0, dtype=np.float32)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


# ---------- static (web/dist) — last, so /api takes priority ----------

_DIST = Path(__file__).resolve().parents[2] / "web" / "dist"
if _DIST.exists():
    @app.get("/")
    async def root_index():
        return FileResponse(_DIST / "index.html")

    @app.get("/{path:path}")
    async def spa_fallback(path: str):
        target = _DIST / path
        if target.exists() and target.is_file():
            return FileResponse(target)
        # Fall back to index.html for client-side routing
        return FileResponse(_DIST / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "service": "rawvox",
            "docs": "/docs",
            "note": "frontend not built — run `cd web && pnpm build`",
        }


if __name__ == "__main__":
    uvicorn.run(
        "src.pipeline.server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
