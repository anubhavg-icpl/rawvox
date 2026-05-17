import { SectionHeader } from "./SectionHeader";
import { Play } from "lucide-react";

const voices = [
  {
    voice: "af_bella",
    label: "Bella",
    backend: "kokoro",
    grade: "A",
    style: "warm, sultry, highest quality — the definitive seductive voice",
  },
  {
    voice: "af_heart",
    label: "Heart",
    backend: "kokoro",
    grade: "A",
    style: "intimate, emotional, heartfelt — whispers feel real",
  },
  {
    voice: "af_nicole",
    label: "Nicole",
    backend: "kokoro",
    grade: "B−",
    style: "close intimate mic, ASMR-like — headphones recommended",
  },
  {
    voice: "bf_emma",
    label: "Emma",
    backend: "kokoro",
    grade: "B−",
    style: "British, sophisticated, elegant seduction",
  },
  {
    voice: "en-US-AriaNeural",
    label: "Aria",
    backend: "edge-tts",
    grade: "—",
    style: "warm, intimate, smooth (Microsoft neural fallback)",
  },
  {
    voice: "en-US-AnaNeural",
    label: "Ana",
    backend: "edge-tts",
    grade: "—",
    style: "velvety, sultry, deep",
  },
];

const gradeTone: Record<string, string> = {
  A: "text-raw-glow",
  "B−": "text-amber",
  "—": "text-muted",
};

export function VoicesSection() {
  return (
    <section id="voices" className="relative py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHeader
          num="04·"
          eyebrow="seductive tts"
          title={
            <>
              Nine voices.
              <br />
              Slow, sultry, raw.
            </>
          }
          desc="Kokoro-82M leads: the #1 open TTS on HuggingFace, 9.7M downloads. Auto-fallback chain through edge-tts, macOS say, and Coqui XTTS-v2 with voice cloning."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map((v) => (
            <div
              key={v.voice}
              className="group p-6 rounded-xl border border-border-subtle bg-elev-1/60 hover:border-raw/60 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display text-2xl text-primary">
                    {v.label}
                  </div>
                  <div className="font-mono text-xs text-muted mt-0.5">
                    {v.voice} · {v.backend}
                  </div>
                </div>
                <button
                  className="size-10 rounded-full bg-elev-2 hover:bg-raw transition-colors grid place-items-center border border-border-subtle hover:border-raw"
                  aria-label={`Preview ${v.label}`}
                >
                  <Play className="size-4 fill-current text-primary" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  grade
                </span>
                <span
                  className={`font-display text-lg font-bold ${gradeTone[v.grade]}`}
                >
                  {v.grade}
                </span>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                {v.style}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
