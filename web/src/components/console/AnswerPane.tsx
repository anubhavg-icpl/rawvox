import { motion } from "framer-motion";
import type { Source } from "@/lib/api";

export function AnswerPane({
  answer,
  sources,
  confidence,
  busy,
}: {
  answer: string;
  sources: Source[];
  confidence: number;
  busy: boolean;
}) {
  const paras = answer ? answer.split("\n\n").filter(Boolean) : [];

  return (
    <div className="rounded-xl border border-border-subtle bg-elev-1/60 p-6 min-h-[200px]">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          answer
        </div>
        {confidence > 0 && (
          <div className="font-mono text-[11px] text-muted">
            confidence{" "}
            <span className={confidence > 0.5 ? "text-mint" : "text-amber"}>
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {!answer && !busy && (
        <div className="text-muted text-sm italic">
          The synthesizer will speak here after the search lands.
        </div>
      )}

      {busy && !answer && (
        <div className="font-mono text-cyber text-sm flex items-center gap-3">
          <span className="inline-block size-2 rounded-full bg-cyber animate-pulse" />
          searching · crawling · ranking · synthesizing
        </div>
      )}

      <div className="space-y-4">
        {paras.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="text-primary text-[15px] leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
            sources · {sources.length}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:border-raw/60 transition-colors"
              >
                <span className="font-mono text-[11px] text-muted shrink-0 mt-0.5">
                  [{i + 1}]
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-primary truncate group-hover:text-raw-glow transition-colors">
                    {s.title || s.url}
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    {s.engine} · {s.url}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
