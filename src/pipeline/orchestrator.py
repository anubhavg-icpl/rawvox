"""
End-to-end pipeline orchestrator.
ASR (mic) → Query Extraction → Deep Web Search → Content Extraction → TTS Output
Fully uncensored, no content filtering at any stage.
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path

import yaml

from src.asr.engine import RealTimeASR, TranscriptionResult
from src.search.engine import UncensoredSearchEngine
from src.extractor.engine import ContentExtractor, SynthesizedAnswer
from src.tts.engine import TTSEngine


class Pipeline:
    def __init__(self, config_path: str = "config/settings.yaml"):
        self.config = self._load_config(config_path)
        self.asr = RealTimeASR(self.config.get("asr", {}))
        self.search_engine = UncensoredSearchEngine(self.config.get("search", {}))
        self.extractor = ContentExtractor()
        self.tts = TTSEngine(self.config.get("tts", {}))
        self.pipeline_config = self.config.get("pipeline", {})
        self.transcript_dir = Path(self.pipeline_config.get("transcript_dir", "./transcripts"))
        self.transcript_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _load_config(path: str) -> dict:
        config_file = Path(path)
        if config_file.exists():
            with open(config_file) as f:
                return yaml.safe_load(f)
        return {}

    async def run_query(self, query: str, speak: bool = True) -> SynthesizedAnswer:
        """Run the full pipeline for a text query: Search → Extract → Optionally TTS."""
        print(f"\n{'='*60}")
        print(f"[Pipeline] Processing query: {query}")
        print(f"{'='*60}")

        # Step 1: Deep search
        print("\n[Pipeline] Step 1: Deep web search...")
        search_results = await self.search_engine.search(query, deep=True)
        print(f"[Pipeline] Got {len(search_results)} results")

        # Step 2: Extract and synthesize
        print("\n[Pipeline] Step 2: Extracting and synthesizing content...")
        answer = self.extractor.synthesize(query, search_results)
        print(f"[Pipeline] Synthesis complete (confidence: {answer.confidence:.2f})")

        # Step 3: TTS output
        if speak and self.pipeline_config.get("output_format") in ("audio", "both"):
            print("\n[Pipeline] Step 3: Generating speech output...")
            # speak() now auto-detects backend and plays by default
            self.tts.speak(answer.answer[:3000], play=True)

        # Step 4: Save transcript
        if self.pipeline_config.get("save_transcripts", True):
            self._save_transcript(query, answer)

        return answer

    async def run_interactive(self):
        """Interactive mode: listen via mic, search, respond. Continuous loop."""
        print("\n" + "="*60)
        print("  UNCENSORED AI ASR + DEEP SEARCH PIPELINE")
        print("  Speak your query. I will search and respond.")
        print("  Press Ctrl+C to exit.")
        print("="*60 + "\n")

        self.asr.load_model()

        def on_transcription(result: TranscriptionResult):
            if result.text.strip():
                # Run the search pipeline asynchronously
                answer = asyncio.run(self.run_query(result.text.strip(), speak=True))
                self._print_answer(answer)

        try:
            self.asr.listen_and_transcribe(callback=on_transcription)
        except KeyboardInterrupt:
            print("\n[Pipeline] Shutting down...")
        finally:
            await self.search_engine.close()

    async def run_once(self, audio_file: str = None, query: str = None):
        """Run a single query (from audio file or text)."""
        if audio_file:
            self.asr.load_model()
            result = self.asr.transcribe_file(audio_file)
            if result is None:
                print("[Pipeline] No speech detected in audio file")
                return
            query = result.text

        if query:
            answer = await self.run_query(query, speak=True)
            self._print_answer(answer)
            return answer

        print("[Pipeline] No input provided. Use --audio <file> or --query <text>")

    def _print_answer(self, answer: SynthesizedAnswer):
        print("\n" + "-"*60)
        print("ANSWER:")
        print("-"*60)
        print(answer.answer)
        print("-"*60)
        print("SOURCES:")
        for src in answer.sources[:5]:
            print(f"  [{src['engine']}] {src['title']}")
            print(f"    {src['url']}")
        print("-"*60)
        print(f"Confidence: {answer.confidence:.2%}")
        print("-"*60 + "\n")

    def _save_transcript(self, query: str, answer: SynthesizedAnswer):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.transcript_dir / f"transcript_{timestamp}.json"
        data = {
            "timestamp": timestamp,
            "query": query,
            "answer": answer.answer,
            "sources": answer.sources,
            "confidence": answer.confidence,
        }
        with open(filename, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[Pipeline] Transcript saved: {filename}")
