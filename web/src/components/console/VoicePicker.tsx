import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause } from "lucide-react";
import { api, type Voice } from "@/lib/api";
import { cn } from "@/lib/utils";

const gradeTone: Record<string, string> = {
  A: "text-raw-glow",
  "B-": "text-amber",
  "C+": "text-cyber",
  C: "text-cyber",
  D: "text-muted",
  "-": "text-muted",
};

const SAMPLE_TEXT =
  "Hello. I'm RawVox. Speak to me — I'll search the raw web and whisper it back.";

export function VoicePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: Voice) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["voices"],
    queryFn: api.voices,
  });

  const [previewing, setPreviewing] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const preview = async (v: Voice) => {
    if (previewing === v.voice && audioEl) {
      audioEl.pause();
      setPreviewing(null);
      return;
    }
    if (audioEl) audioEl.pause();
    try {
      const blob = await api.tts(SAMPLE_TEXT, v.voice);
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.onended = () => {
        setPreviewing(null);
        URL.revokeObjectURL(url);
      };
      setAudioEl(a);
      setPreviewing(v.voice);
      a.play().catch(() => setPreviewing(null));
    } catch {
      setPreviewing(null);
    }
  };

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
        voice
      </div>
      {isLoading && (
        <div className="text-muted text-xs">loading voices...</div>
      )}
      <div className="space-y-1">
        {data?.voices.map((v) => {
          const active = selected === v.voice;
          const playing = previewing === v.voice;
          return (
            <div
              key={v.voice}
              className={cn(
                "w-full p-3 rounded-lg border transition-colors flex items-start gap-3",
                active
                  ? "border-raw/60 bg-raw/10"
                  : "border-border-subtle hover:border-border-strong bg-elev-1/40"
              )}
            >
              <button
                onClick={() => onSelect(v)}
                className="flex-1 text-left"
                aria-label={`Select ${v.voice}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-primary">
                    {v.voice.replace(/^[abz][fm]_/, "")}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      gradeTone[v.grade] ?? "text-muted"
                    )}
                  >
                    {v.grade}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-muted">
                  {v.backend}
                </div>
                {active && (
                  <div className="font-mono text-[10px] text-raw-glow mt-1">
                    ▮ active
                  </div>
                )}
              </button>
              <button
                onClick={() => preview(v)}
                className="size-7 rounded-md bg-elev-2 hover:bg-raw text-secondary hover:text-white grid place-items-center transition-colors shrink-0 mt-0.5"
                aria-label={`Preview ${v.voice}`}
                title={`Preview ${v.voice}`}
              >
                {playing ? (
                  <Pause className="size-3 fill-current" />
                ) : (
                  <Play className="size-3 fill-current translate-x-px" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
