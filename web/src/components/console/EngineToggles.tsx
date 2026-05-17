import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function EngineToggles() {
  const { data } = useQuery({ queryKey: ["engines"], queryFn: api.engines });
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
        engines
      </div>
      <div className="space-y-1.5">
        {data?.engines.map((e) => (
          <label
            key={e.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-elev-1/60 cursor-pointer"
          >
            <input
              type="checkbox"
              defaultChecked={e.enabled}
              className="accent-raw"
            />
            <span className="text-sm text-secondary">{e.name}</span>
            <span className="ml-auto font-mono text-[10px] text-muted">
              {e.enabled ? "on" : "off"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
