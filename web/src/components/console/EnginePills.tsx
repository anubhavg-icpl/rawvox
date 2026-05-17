import { cn } from "@/lib/utils";
import type { EngineStatus } from "@/hooks/usePipeline";

const statusTone: Record<EngineStatus, string> = {
  idle: "text-muted border-border-subtle",
  running: "text-cyber border-cyber/40 animate-pulse",
  done: "text-mint border-mint/40",
  error: "text-raw-glow border-raw/40",
};

const statusIcon: Record<EngineStatus, string> = {
  idle: "·",
  running: "▮",
  done: "✓",
  error: "✗",
};

export function EnginePills({
  engines,
}: {
  engines: Record<string, { status: EngineStatus; count?: number }>;
}) {
  const entries = Object.entries(engines);
  if (entries.length === 0) {
    return (
      <div className="font-mono text-xs text-muted">
        engines idle · run a query to begin
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([name, e]) => (
        <span
          key={name}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-elev-1/40 font-mono text-xs",
            statusTone[e.status]
          )}
        >
          <span className="select-none">{statusIcon[e.status]}</span>
          <span>{name}</span>
          {e.count !== undefined && (
            <span className="text-muted">· {e.count}</span>
          )}
        </span>
      ))}
    </div>
  );
}
