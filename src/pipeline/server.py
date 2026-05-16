"""
FastAPI server for the Uncensored ASR + Deep Search Pipeline.
REST API for programmatic access.
"""

import asyncio
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from src.pipeline.orchestrator import Pipeline

app = FastAPI(
    title="Uncensored AI ASR + Deep Search API",
    description="End-to-end pipeline: Speech → Transcription → Deep Web Search → Synthesis → TTS",
    version="1.0.0",
)

pipeline: Pipeline = None


class SearchRequest(BaseModel):
    query: str
    deep: bool = True
    speak: bool = False
    language: str | None = None


class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: list[dict]
    confidence: float
    audio_file: str | None = None


@app.on_event("startup")
async def startup():
    global pipeline
    pipeline = Pipeline()


@app.post("/search", response_model=QueryResponse)
async def search_endpoint(request: SearchRequest):
    """Search with a text query. Returns synthesized answer with sources."""
    answer = await pipeline.run_query(request.query, speak=request.speak)
    return QueryResponse(
        query=request.query,
        answer=answer.answer,
        sources=answer.sources,
        confidence=answer.confidence,
    )


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Upload an audio file for transcription."""
    import tempfile

    suffix = Path(file.filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        pipeline.asr.load_model()
        result = pipeline.asr.transcribe_file(tmp_path)
        if result is None:
            raise HTTPException(status_code=400, detail="No speech detected in audio")

        return {
            "text": result.text,
            "language": result.language,
            "language_probability": result.language_prob,
            "words": result.words,
        }
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.post("/transcribe-and-search", response_model=QueryResponse)
async def transcribe_and_search(file: UploadFile = File(...)):
    """Upload audio, transcribe, then deep search the transcription."""
    import tempfile

    suffix = Path(file.filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        answer = await pipeline.run_once(audio_file=tmp_path)
        if answer is None:
            raise HTTPException(status_code=400, detail="No speech detected or no results")
        return QueryResponse(
            query="audio_query",
            answer=answer.answer,
            sources=answer.sources,
            confidence=answer.confidence,
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "uncensored-asr-search"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
