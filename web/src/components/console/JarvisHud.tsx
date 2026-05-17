import { motion, AnimatePresence } from "framer-motion";
import { JarvisCore, type CoreState } from "../avatar/JarvisCore";
import { JarvisRings } from "./JarvisRings";

const LABEL: Record<CoreState, string> = {
  idle: "IDLE",
  listen: "READING",
  think: "PROCESSING",
  speak: "SPEAKING",
};

const STATE_COLOR: Record<CoreState, string> = {
  idle: "var(--color-muted)",
  listen: "var(--color-cyber)",
  think: "var(--color-violet)",
  speak: "var(--color-raw-glow)",
};

const SUB: Record<CoreState, string> = {
  idle: "awaiting voice or query",
  listen: "transcribing in realtime",
  think: "crawling · ranking · synthesizing",
  speak: "vocalizing answer",
};

/**
 * Composite Jarvis HUD: pulsing 3D ASCII core + rotating rings +
 * status badge + sub-state caption. Use this as the centerpiece of /console.
 */
export function JarvisHud({
  state,
  level,
  caption,
}: {
  state: CoreState;
  level: number;
  caption?: string;
}) {
  const color = STATE_COLOR[state];

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      <div className="relative aspect-square">
        {/* Outer glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background:
              state === "speak"
                ? "radial-gradient(circle, rgb(220 38 38 / 0.5) 0%, transparent 65%)"
                : state === "think"
                  ? "radial-gradient(circle, rgb(139 92 246 / 0.4) 0%, transparent 65%)"
                  : state === "listen"
                    ? "radial-gradient(circle, rgb(0 229 255 / 0.32) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgb(220 38 38 / 0.16) 0%, transparent 65%)",
          }}
          animate={{ scale: state === "speak" ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 0.45, repeat: state === "speak" ? Infinity : 0 }}
        />

        {/* Rotating rings overlay */}
        <JarvisRings state={state} level={level} />

        {/* Core orb */}
        <div className="absolute inset-[12%] grid place-items-center">
          <JarvisCore state={state} level={level} size={360} />
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.span
              className="size-1.5 rounded-full"
              style={{ background: color }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span
              className="font-display text-3xl md:text-4xl font-bold tracking-[0.22em]"
              style={{ color }}
            >
              {LABEL[state]}
            </span>
            <motion.span
              className="size-1.5 rounded-full"
              style={{ background: color }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {SUB[state]}
        </div>

        {/* Live audio caption — only when speaking */}
        {state === "speak" && caption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 max-w-md text-center font-mono text-sm text-secondary leading-relaxed line-clamp-3"
          >
            "{caption.slice(0, 220)}{caption.length > 220 ? "..." : ""}"
          </motion.div>
        )}
      </div>
    </div>
  );
}
