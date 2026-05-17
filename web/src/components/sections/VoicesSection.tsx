import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

type Voice = {
  voice: string;
  label: string;
  backend: string;
  grade: string;
  style: string;
};

const voices: Voice[] = [
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

const SAMPLE_BASE = "/samples"; // served by FastAPI static OR Vite public/

export function VoicesSection() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [available, setAvailable] = useState<Record<string, boolean>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Probe which samples exist so we can hide play buttons for missing ones.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const probes = await Promise.all(
        voices.map(async (v) => {
          try {
            const r = await fetch(`${SAMPLE_BASE}/${v.voice}.wav`, {
              method: "HEAD",
              cache: "force-cache",
            });
            return [v.voice, r.ok] as const;
          } catch {
            return [v.voice, false] as const;
          }
        })
      );
      if (!cancelled) {
        setAvailable(Object.fromEntries(probes));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Single audio element shared across cards — only one plays at a time.
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "none";
      a.onended = () => {
        setPlayingId(null);
        setProgress(0);
      };
      a.ontimeupdate = () => {
        if (a.duration > 0) setProgress(a.currentTime / a.duration);
      };
      audioRef.current = a;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = (v: Voice) => {
    const a = audioRef.current!;
    if (playingId === v.voice) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.pause();
    setLoadingId(v.voice);
    a.src = `${SAMPLE_BASE}/${v.voice}.wav`;
    a.currentTime = 0;
    a
      .play()
      .then(() => {
        setPlayingId(v.voice);
        setLoadingId(null);
      })
      .catch(() => {
        setLoadingId(null);
        setPlayingId(null);
      });
  };

  const samplesExist = Object.values(available).some(Boolean);

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
          desc="Kokoro-82M leads: the #1 open TTS on HuggingFace, 9.7M downloads. Auto-fallback chain through edge-tts and Coqui XTTS-v2 with voice cloning. Click ▶ on any card to hear a sample."
        />

        {!samplesExist && (
          <div className="mt-8 font-mono text-xs text-muted border border-border-subtle rounded-lg p-3 max-w-xl">
            ▮ no samples baked yet — they ship after the first{" "}
            <code className="text-cyber">docker compose up --build</code>
          </div>
        )}

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map((v) => {
            const ok = available[v.voice];
            const isPlaying = playingId === v.voice;
            const isLoading = loadingId === v.voice;
            return (
              <div
                key={v.voice}
                className={cn(
                  "group p-6 rounded-xl border bg-elev-1/60 transition-colors",
                  isPlaying
                    ? "border-raw/80 shadow-[var(--shadow-glow-raw)]"
                    : "border-border-subtle hover:border-raw/40"
                )}
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
                  <div className="flex items-center gap-1">
                    {ok && (
                      <a
                        href={`${SAMPLE_BASE}/${v.voice}.wav`}
                        download
                        className="size-9 rounded-full border border-border-subtle text-muted hover:text-primary hover:border-border-strong grid place-items-center transition-colors"
                        aria-label={`Download ${v.label}`}
                        title="Download sample"
                      >
                        <Download className="size-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => ok && toggle(v)}
                      disabled={!ok || isLoading}
                      className={cn(
                        "size-11 rounded-full grid place-items-center transition-all border",
                        isPlaying
                          ? "bg-raw text-white border-raw shadow-[var(--shadow-glow-raw)]"
                          : ok
                            ? "bg-elev-2 hover:bg-raw text-primary hover:text-white border-border-subtle hover:border-raw"
                            : "bg-elev-2/40 text-muted border-border-subtle opacity-50 cursor-not-allowed"
                      )}
                      aria-label={`Preview ${v.label}`}
                      title={ok ? `Play ${v.label}` : "Sample not baked yet"}
                    >
                      {isLoading ? (
                        <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="size-4 fill-current" />
                      ) : (
                        <Play className="size-4 fill-current translate-x-px" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    grade
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg font-bold",
                      gradeTone[v.grade] ?? "text-muted"
                    )}
                  >
                    {v.grade}
                  </span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{v.style}</p>

                {/* Progress bar — visible while playing */}
                {isPlaying && (
                  <div className="mt-4 h-0.5 rounded-full bg-elev-2 overflow-hidden">
                    <div
                      className="h-full bg-raw transition-[width] duration-150"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 font-mono text-[11px] text-muted">
          14 total voices available · 9 Kokoro · 5 edge-tts neural ·{" "}
          <a href="#api" className="underline hover:text-primary">
            full list via /api/voices
          </a>
        </div>
      </div>
    </section>
  );
}
