import { useQuery } from "@tanstack/react-query";
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

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
        voice
      </div>
      {isLoading && (
        <div className="text-muted text-xs">loading voices...</div>
      )}
      <div className="space-y-1">
        {data?.voices.map((v) => (
          <button
            key={v.voice}
            onClick={() => onSelect(v)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-colors",
              selected === v.voice
                ? "border-raw/60 bg-raw/10"
                : "border-border-subtle hover:border-border-strong bg-elev-1/40"
            )}
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
              {v.backend} · {v.voice}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
