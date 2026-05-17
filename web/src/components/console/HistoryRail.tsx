import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function HistoryRail() {
  const { data } = useQuery({
    queryKey: ["transcripts"],
    queryFn: api.transcripts,
    refetchInterval: 10_000,
  });

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
        history
      </div>
      <div className="space-y-1">
        {data?.transcripts.length === 0 && (
          <div className="text-muted text-xs italic">no transcripts yet</div>
        )}
        {data?.transcripts.map((t) => (
          <a
            key={t.id}
            href={`/api/transcripts/${t.id}`}
            target="_blank"
            rel="noreferrer"
            className="block p-2.5 rounded-lg hover:bg-elev-1/60 transition-colors"
          >
            <div className="text-sm text-primary truncate">{t.query || "—"}</div>
            <div className="font-mono text-[10px] text-muted mt-1 flex items-center gap-2">
              <span>{t.timestamp?.slice(0, 8)}</span>
              <span>·</span>
              <span className={t.confidence > 0.5 ? "text-mint" : "text-amber"}>
                {(t.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
