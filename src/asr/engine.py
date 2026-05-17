"""
Real-time ASR module using faster-whisper.
Captures audio from mic, streams it through Whisper for transcription.
No content filtering, no censorship — raw transcription output.
"""

import queue
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import sounddevice as sd

from faster_whisper import WhisperModel


@dataclass
class TranscriptionResult:
    text: str
    language: str
    language_prob: float
    words: list = field(default_factory=list)
    start_time: float = 0.0
    end_time: float = 0.0


class RealTimeASR:
    def __init__(self, config: dict):
        self.config = config
        self.model = None
        self.audio_queue: queue.Queue = queue.Queue()
        self.is_running = False
        self._audio_buffer = []
        self._lock = threading.Lock()
        self.sample_rate = config.get("sample_rate", 16000)
        self.chunk_duration = config.get("chunk_duration", 5)
        self._chunk_samples = self.sample_rate * self.chunk_duration

    def load_model(self):
        model_size = self.config.get("model", "large-v3")
        device = self.config.get("device", "auto")
        compute_type = self.config.get("compute_type", "int8")

        if device == "auto":
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"

        print(f"[ASR] Loading model: {model_size} on {device} ({compute_type})")
        self.model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )
        print("[ASR] Model loaded successfully")

    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        if status:
            print(f"[ASR] Audio status: {status}")
        with self._lock:
            self._audio_buffer.append(indata.copy())

    def start_capture(self):
        print(f"[ASR] Starting audio capture at {self.sample_rate}Hz")
        self.is_running = True
        self._stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            dtype="float32",
            blocksize=self.sample_rate,
            callback=self._audio_callback,
        )
        self._stream.start()

    def stop_capture(self):
        self.is_running = False
        if hasattr(self, "_stream"):
            self._stream.stop()
            self._stream.close()
        print("[ASR] Audio capture stopped")

    def get_chunk(self) -> np.ndarray | None:
        with self._lock:
            buffer = self._audio_buffer.copy()
            self._audio_buffer.clear()

        if not buffer:
            return None

        audio_data = np.concatenate(buffer, axis=0)
        if audio_data.shape[0] >= self._chunk_samples:
            return audio_data[: self._chunk_samples].flatten().astype(np.float32)

        if len(audio_data) > self.sample_rate:  # At least 1 second
            return audio_data.flatten().astype(np.float32)

        return None

    def transcribe_chunk(self, audio: np.ndarray) -> TranscriptionResult | None:
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        language = self.config.get("language")
        beam_size = self.config.get("beam_size", 5)
        word_timestamps = self.config.get("word_timestamps", True)

        segments, info = self.model.transcribe(
            audio,
            language=language,
            beam_size=beam_size,
            word_timestamps=word_timestamps,
            vad_filter=False,
        )

        full_text = ""
        words = []
        for segment in segments:
            full_text += segment.text
            if segment.words:
                words.extend(
                    [
                        {
                            "word": w.word,
                            "start": w.start,
                            "end": w.end,
                            "probability": w.probability,
                        }
                        for w in segment.words
                    ]
                )

        if not full_text.strip():
            return None

        return TranscriptionResult(
            text=full_text.strip(),
            language=info.language,
            language_prob=info.language_probability,
            words=words,
            start_time=words[0]["start"] if words else 0.0,
            end_time=words[-1]["end"] if words else 0.0,
        )

    def transcribe_file(self, filepath: str | Path) -> TranscriptionResult | None:
        filepath = Path(filepath)
        if not filepath.exists():
            raise FileNotFoundError(f"Audio file not found: {filepath}")

        if self.model is None:
            self.load_model()

        segments, info = self.model.transcribe(
            str(filepath),
            language=self.config.get("language"),
            beam_size=self.config.get("beam_size", 5),
            word_timestamps=self.config.get("word_timestamps", True),
            vad_filter=False,
        )

        full_text = ""
        words = []
        for segment in segments:
            full_text += segment.text
            if segment.words:
                words.extend(
                    [
                        {
                            "word": w.word,
                            "start": w.start,
                            "end": w.end,
                            "probability": w.probability,
                        }
                        for w in segment.words
                    ]
                )

        if not full_text.strip():
            return None

        return TranscriptionResult(
            text=full_text.strip(),
            language=info.language,
            language_prob=info.language_probability,
            words=words,
        )

    def listen_and_transcribe(self, callback=None) -> list[TranscriptionResult]:
        """Continuous real-time listening loop. Calls callback with each result."""
        if self.model is None:
            self.load_model()

        self.start_capture()
        results = []

        try:
            silence_start = time.time()
            silence_threshold = 2.0  # seconds of silence to trigger
            accumulated_text = ""

            print("[ASR] Listening... (Ctrl+C to stop)")
            while self.is_running:
                chunk = self.get_chunk()
                if chunk is None:
                    time.sleep(0.1)
                    continue

                result = self.transcribe_chunk(chunk)
                if result and result.text.strip():
                    accumulated_text += " " + result.text
                    silence_start = time.time()
                    print(f"\r[ASR] Partial: {accumulated_text.strip()}", end="", flush=True)

                # Check if enough silence accumulated
                if accumulated_text.strip() and (time.time() - silence_start) > silence_threshold:
                    final_text = accumulated_text.strip()
                    print(f"\n[ASR] Final: {final_text}")
                    final_result = TranscriptionResult(
                        text=final_text,
                        language=result.language if result else "en",
                        language_prob=result.language_prob if result else 1.0,
                    )
                    results.append(final_result)
                    if callback:
                        callback(final_result)
                    accumulated_text = ""

        except KeyboardInterrupt:
            print("\n[ASR] Stopped by user")
        finally:
            self.stop_capture()

        return results
