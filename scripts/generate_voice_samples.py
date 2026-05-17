#!/usr/bin/env python3
"""
Generate per-voice TTS sample WAV files for the landing page voice gallery.

Usage:
    python scripts/generate_voice_samples.py [output_dir]

Default output_dir = web/public/samples (so vite dev + build pick them up).
In the Docker image we write to /app/web/dist/samples for direct static serve.

Idempotent: skips voices that already have a sample.
Failures per voice are logged and skipped — the build still completes
so the landing always has at least the voices that succeeded.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure repo root is on sys.path when run as a script from inside Docker.
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.tts.engine import TTSEngine  # noqa: E402

SAMPLE_TEXT = (
    "Hello. I'm RawVox. Speak to me, and I'll search the raw web "
    "and whisper it back to you, uncensored."
)


def main(out_dir: str) -> int:
    out = Path(out_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)

    print(f"[samples] output dir: {out}", flush=True)

    engine = TTSEngine({})
    voices = engine.list_seductive_voices()
    ok, skipped, failed = 0, 0, 0

    for v in voices:
        voice_id = v["voice"]
        backend_hint = v["backend"]
        out_file = out / f"{voice_id}.wav"

        if out_file.exists() and out_file.stat().st_size > 1000:
            print(f"[skip] {voice_id} (already present)", flush=True)
            skipped += 1
            continue

        print(f"[gen]  {voice_id:<32} via {backend_hint}", flush=True)

        engine.voice = voice_id
        engine.backend = backend_hint

        try:
            engine.speak(SAMPLE_TEXT, output_path=str(out_file), play=False)
            size = out_file.stat().st_size if out_file.exists() else 0
            if size < 1000:
                raise RuntimeError(f"output too small ({size} bytes)")
            print(f"       -> {size // 1024} KB", flush=True)
            ok += 1
        except Exception as e:
            print(f"[fail] {voice_id}: {e}", flush=True)
            failed += 1
            out_file.unlink(missing_ok=True)

    print(
        f"\n[samples] done · ok={ok} skipped={skipped} failed={failed} "
        f"total={len(voices)}",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "web" / "public" / "samples")
    sys.exit(main(out_dir))
