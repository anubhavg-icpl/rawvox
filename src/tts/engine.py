"""
Uncensored Seductive TTS Engine.
Backends (auto-detected, best first):
  1. Kokoro-82M (HuggingFace #1 TTS, 9.7M downloads) - af_bella, af_heart, af_nicole
  2. edge-tts (Microsoft neural voices) - AriaNeural, MichelleNeural, AnaNeural
  3. macOS say (built-in) - Samantha
  4. Coqui XTTS-v2 (GPU, voice cloning) - any speaker_wav

No content filtering - whatever text goes in, seductive voice comes out.
"""

import asyncio
import subprocess
import tempfile
import threading
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")


class TTSEngine:
    def __init__(self, config: dict = None):
        self.config = config or {}
        self._kokoro_pipeline = None
        self._coqui_model = None
        self.language = self.config.get("language", "en")
        self.voice = self.config.get("voice", "af_bella")
        self.speed = self.config.get("speed", 0.8)  # Kokoro speed (slower = sultrier)
        self.rate = self.config.get("rate", "-20%")  # edge-tts rate
        self.volume = self.config.get("volume", "+5%")
        self.backend = self.config.get("backend", "auto")

    # --- Backend detection (priority order) ---
    def _detect_backend(self) -> str:
        if self.backend != "auto":
            return self.backend
        try:
            from kokoro import KPipeline
            return "kokoro"
        except ImportError:
            pass
        try:
            import edge_tts
            return "edge-tts"
        except ImportError:
            pass
        try:
            result = subprocess.run(["say", "--version"], capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                return "say"
        except Exception:
            pass
        try:
            from TTS.api import TTS
            return "coqui"
        except ImportError:
            pass
        return "none"

    # --- Kokoro: #1 open source TTS, best seductive voices ---
    def _load_kokoro(self):
        if self._kokoro_pipeline is None:
            from kokoro import KPipeline
            lang = "b" if self.language == "en-gb" else "a"
            print("[TTS] Loading Kokoro-82M (9.7M downloads, #1 HF TTS)...")
            self._kokoro_pipeline = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
            print("[TTS] Kokoro loaded!")

    def _speak_kokoro(self, text: str, output_path: str) -> str:
        self._load_kokoro()
        import numpy as np
        import soundfile as sf

        voice = self.voice
        # Map friendly names to Kokoro voice codes
        voice_map = {
            "bella": "af_bella", "heart": "af_heart", "nicole": "af_nicole",
            "aoede": "af_aoede", "sarah": "af_sarah", "kore": "af_kore",
            "emma-british": "bf_emma", "alice": "bf_alice", "isabella": "bf_isabella",
            "lily": "bf_lily",
        }
        if voice in voice_map:
            voice = voice_map[voice]
        # If voice doesn't start with a/f/b prefix, default to af_bella
        if not any(voice.startswith(p) for p in ("af_", "am_", "bf_", "bm_", "jf_", "jm_", "zf_", "zm_")):
            voice = "af_bella"

        full_audio = []
        for gs, ps, audio in self._kokoro_pipeline(text, voice=voice, speed=self.speed):
            full_audio.append(audio)

        if full_audio:
            combined = np.concatenate(full_audio)
            sf.write(output_path, combined, 24000)
        return output_path

    # --- edge-tts: Microsoft neural voices ---
    async def _speak_edge_tts(self, text: str, output_path: str) -> str:
        import edge_tts
        # Map Kokoro-style names to edge-tts voices
        voice = self.voice
        voice_map = {
            "af_bella": "en-US-AriaNeural",
            "af_heart": "en-US-AnaNeural",
            "af_nicole": "en-US-MichelleNeural",
            "af_aoede": "en-US-JennyNeural",
            "af_sarah": "en-US-EmmaNeural",
            "bf_emma": "en-GB-SoniaNeural",
            "bella": "en-US-AriaNeural",
            "heart": "en-US-AnaNeural",
            "nicole": "en-US-MichelleNeural",
            "aria": "en-US-AriaNeural",
            "michelle": "en-US-MichelleNeural",
            "ana": "en-US-AnaNeural",
            "jenny": "en-US-JennyNeural",
            "emma": "en-US-EmmaNeural",
            "sonia": "en-GB-SoniaNeural",
        }
        if voice in voice_map:
            voice = voice_map[voice]
        # If it's not a Neural voice name, default to AriaNeural
        if "Neural" not in voice:
            voice = "en-US-AriaNeural"

        communicate = edge_tts.Communicate(text, voice, rate=self.rate, volume=self.volume)
        await communicate.save(output_path)
        return output_path

    # --- macOS say ---
    def _speak_say(self, text: str, output_path: str) -> str:
        aiff_path = output_path.replace(".wav", ".aiff")
        subprocess.run(["say", "-v", "Samantha", "-r", "160", "-o", aiff_path, "--", text],
                       capture_output=True, text=True, timeout=60)
        subprocess.run(["afconvert", aiff_path, output_path, "-f", "WAVE", "-d", "LEI16"],
                       capture_output=True, text=True, timeout=30)
        Path(aiff_path).unlink(missing_ok=True)
        return output_path

    # --- Coqui XTTS-v2 (GPU, voice cloning) ---
    def _load_coqui(self):
        if self._coqui_model is None:
            from TTS.api import TTS as TTSApi
            self._coqui_model = TTSApi(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

    def _speak_coqui(self, text: str, output_path: str) -> str:
        self._load_coqui()
        kwargs = {"text": text, "file_path": output_path, "language": self.language}
        speaker_wav = self.config.get("speaker_wav")
        if speaker_wav and Path(speaker_wav).exists():
            kwargs["speaker_wav"] = speaker_wav
        self._coqui_model.tts_to_file(**kwargs)
        return output_path

    # --- Async-safe runner ---
    def _run_async(self, coro):
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
        if loop and loop.is_running():
            result = [None]
            exc = [None]
            def _target():
                try:
                    result[0] = asyncio.run(coro)
                except Exception as e:
                    exc[0] = e
            t = threading.Thread(target=_target)
            t.start()
            t.join()
            if exc[0]:
                raise exc[0]
            return result[0]
        else:
            return asyncio.run(coro)

    # --- Public API ---
    def speak(self, text: str, output_path: str | Path | None = None, play: bool = True) -> str:
        if output_path is None:
            output_path = tempfile.mktemp(suffix=".wav")
        output_path = str(output_path)

        backend = self._detect_backend()
        print(f"[TTS] Voice: {self.voice} | Backend: {backend}")

        if backend == "kokoro":
            self._speak_kokoro(text, output_path)
        elif backend == "edge-tts":
            self._run_async(self._speak_edge_tts(text, output_path))
        elif backend == "say":
            self._speak_say(text, output_path)
        elif backend == "coqui":
            self._speak_coqui(text, output_path)
        else:
            print("[TTS] No TTS backend available!")
            return ""

        print(f"[TTS] Audio saved: {output_path}")

        if play:
            self.play_audio(output_path)

        return output_path

    @staticmethod
    def play_audio(audio_path: str):
        if not audio_path or not Path(audio_path).exists():
            return
        import sounddevice as sd
        import soundfile as sf
        data, samplerate = sf.read(audio_path)
        sd.play(data, samplerate)
        sd.wait()

    def list_seductive_voices(self) -> list[dict]:
        """All available seductive voices across backends."""
        return [
            # Kokoro voices (best quality, #1 on HuggingFace)
            {"voice": "af_bella", "backend": "kokoro", "grade": "A",
             "style": "warm, sultry, highest quality - the definitive seductive voice"},
            {"voice": "af_heart", "backend": "kokoro", "grade": "A",
             "style": "intimate, emotional, heartfelt - whispers feel real"},
            {"voice": "af_nicole", "backend": "kokoro", "grade": "B-",
             "style": "close intimate mic feel, ASMR-like, headphones recommended"},
            {"voice": "af_aoede", "backend": "kokoro", "grade": "C+",
             "style": "breathy, soft, gentle whispering quality"},
            {"voice": "af_sarah", "backend": "kokoro", "grade": "C+",
             "style": "smooth, confident, natural warmth"},
            {"voice": "af_kore", "backend": "kokoro", "grade": "C+",
             "style": "clear, warm, pleasant conversational"},
            {"voice": "bf_emma", "backend": "kokoro", "grade": "B-",
             "style": "British, sophisticated, elegant seduction"},
            {"voice": "bf_isabella", "backend": "kokoro", "grade": "C",
             "style": "British, refined, cultured allure"},
            {"voice": "bf_lily", "backend": "kokoro", "grade": "D",
             "style": "British, youthful, playful teasing"},
            # edge-tts voices (fallback)
            {"voice": "en-US-AriaNeural", "backend": "edge-tts", "grade": "-",
             "style": "warm, intimate, smooth (News/Novel trained)"},
            {"voice": "en-US-MichelleNeural", "backend": "edge-tts", "grade": "-",
             "style": "husky, deep, confident (News/Novel trained)"},
            {"voice": "en-US-AnaNeural", "backend": "edge-tts", "grade": "-",
             "style": "velvety, sultry, deep"},
            {"voice": "en-GB-SoniaNeural", "backend": "edge-tts", "grade": "-",
             "style": "British, sophisticated seduction"},
            {"voice": "en-IE-EmilyNeural", "backend": "edge-tts", "grade": "-",
             "style": "Irish, melodic, enchanting"},
        ]
