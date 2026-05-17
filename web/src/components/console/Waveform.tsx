import { motion } from "framer-motion";

const BARS = 48;

export function Waveform({
  level,
  active,
  color = "var(--color-raw-glow)",
}: {
  level: number;
  active: boolean;
  color?: string;
}) {
  return (
    <div
      className="flex items-end justify-center gap-[3px] h-12 select-none"
      aria-hidden
    >
      {Array.from({ length: BARS }).map((_, i) => {
        const center = BARS / 2;
        const dist = Math.abs(i - center) / center;
        const falloff = 1 - dist * 0.6;
        const base = active ? 0.12 + level * falloff * 1.5 : 0.06;
        const jitter = active ? Math.random() * 0.2 : 0;
        const h = Math.max(0.06, Math.min(1, base + jitter)) * 100;

        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full"
            style={{ background: color, height: `${h}%` }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
