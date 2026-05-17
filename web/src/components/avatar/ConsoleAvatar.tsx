import { motion } from "framer-motion";
import { AsciiHead, type AvatarState } from "./AsciiHead";

export function ConsoleAvatar({
  busy,
  speaking,
  level = 0,
}: {
  busy: boolean;
  speaking: boolean;
  level?: number;
}) {
  const state: AvatarState = speaking
    ? "speak"
    : busy
      ? "think"
      : level > 0.05
        ? "listen"
        : "idle";

  return (
    <div className="relative aspect-square w-full max-w-[300px] mx-auto">
      <motion.div
        className="absolute inset-0 rounded-2xl blur-3xl"
        style={{
          background:
            state === "speak"
              ? "radial-gradient(circle, rgb(220 38 38 / 0.45) 0%, transparent 65%)"
              : state === "think"
                ? "radial-gradient(circle, rgb(139 92 246 / 0.35) 0%, transparent 65%)"
                : state === "listen"
                  ? "radial-gradient(circle, rgb(0 229 255 / 0.3) 0%, transparent 65%)"
                  : "radial-gradient(circle, rgb(220 38 38 / 0.15) 0%, transparent 65%)",
        }}
        animate={{ scale: state === "speak" ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.45, repeat: state === "speak" ? Infinity : 0 }}
      />

      <div className="absolute inset-3 rounded-2xl border border-border-strong bg-gradient-to-br from-elev-1 to-base overflow-hidden grid place-items-center">
        <AsciiHead state={state} level={level} />
      </div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted bg-elev-1 border border-border-subtle px-3 py-1 rounded-full">
          ▮ {state}
        </div>
      </div>
    </div>
  );
}
