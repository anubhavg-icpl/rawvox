import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AsciiHead, type AvatarState } from "@/components/avatar/AsciiHead";

/**
 * Landing-only demo wrapper around AsciiHead.
 * Cycles through avatar states on a timer and fakes a speech level
 * when in the `speak` phase so the mouth moves naturally.
 */

type Phase = { state: AvatarState; ms: number };
const SCRIPT: Phase[] = [
  { state: "idle", ms: 2600 },
  { state: "listen", ms: 3000 },
  { state: "think", ms: 2400 },
  { state: "speak", ms: 4400 },
];

export function HeroAvatar() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [level, setLevel] = useState(0);

  // Phase cycler
  useEffect(() => {
    const t = setTimeout(
      () => setPhaseIdx((i) => (i + 1) % SCRIPT.length),
      SCRIPT[phaseIdx].ms
    );
    return () => clearTimeout(t);
  }, [phaseIdx]);

  // Fake amplitude when speaking — modulated sine + jitter so the mouth
  // moves like real prosody rather than a flat hum.
  useEffect(() => {
    const phase = SCRIPT[phaseIdx];
    if (phase.state !== "speak") {
      setLevel(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const base = 0.45 + Math.sin(t * 5.2) * 0.32;
      const jitter = (Math.random() - 0.5) * 0.18;
      const env = Math.min(1, t * 1.4) * Math.min(1, (phase.ms / 1000 - t) * 1.4);
      const lvl = Math.max(0, Math.min(1, (base + jitter) * env));
      setLevel(lvl);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phaseIdx]);

  const state = SCRIPT[phaseIdx].state;

  const haloColor =
    state === "speak"
      ? "rgb(220 38 38 / 0.45)"
      : state === "think"
        ? "rgb(139 92 246 / 0.4)"
        : state === "listen"
          ? "rgb(0 229 255 / 0.32)"
          : "rgb(220 38 38 / 0.18)";

  return (
    <div className="relative aspect-square w-full max-w-[440px] mx-auto">
      {/* Halo */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-3xl blur-3xl"
        style={{ background: `radial-gradient(circle, ${haloColor} 0%, transparent 65%)` }}
        animate={{ scale: state === "speak" ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.45, repeat: state === "speak" ? Infinity : 0 }}
      />

      {/* Frame */}
      <div className="absolute inset-4 rounded-2xl border border-border-strong bg-gradient-to-br from-elev-1 to-base overflow-hidden grid place-items-center shadow-[var(--shadow-elev-2)]">
        <div className="absolute inset-0 bg-dots opacity-50" />

        {/* Mock terminal header */}
        <div className="absolute top-0 left-0 right-0 h-8 border-b border-border-subtle bg-base/60 flex items-center justify-between px-3 z-10">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#FF5F57]" />
            <span className="size-2 rounded-full bg-[#FEBC2E]" />
            <span className="size-2 rounded-full bg-[#28C840]" />
          </div>
          <span className="font-mono text-[10px] text-muted">
            rawvox · avatar
          </span>
          <span className="size-2" />
        </div>

        {/* The head */}
        <div className="pt-6 w-full h-full grid place-items-center">
          <AsciiHead state={state} level={level} size={360} />
        </div>
      </div>

      {/* State label */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted bg-elev-1 border border-border-subtle px-3 py-1 rounded-full">
          <span
            className={
              state === "speak"
                ? "text-raw-glow"
                : state === "think"
                  ? "text-violet"
                  : state === "listen"
                    ? "text-cyber"
                    : "text-muted"
            }
          >
            ▮
          </span>{" "}
          {state}
        </div>
      </div>
    </div>
  );
}
