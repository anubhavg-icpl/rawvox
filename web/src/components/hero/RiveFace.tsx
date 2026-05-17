import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Placeholder for Rive face. Actual `.riv` lands in /public/rive/face.riv.
 * Once asset ready, swap with:
 *   import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
 *   const { rive, RiveComponent } = useRive({
 *     src: "/rive/face.riv",
 *     stateMachines: "State Machine 1",
 *     autoplay: true,
 *   });
 *
 * For now: animated SVG silhouette that conveys the intent.
 */
export function RiveFace() {
  const [state, setState] = useState<"idle" | "listen" | "think" | "speak">("idle");

  useEffect(() => {
    const seq: typeof state[] = ["idle", "listen", "think", "speak", "idle"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setState(seq[i]);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[440px] mx-auto">
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(220 38 38 / 0.35) 0%, transparent 65%)",
        }}
        animate={{
          scale: state === "speak" ? [1, 1.08, 1] : 1,
          opacity: state === "idle" ? 0.6 : 0.9,
        }}
        transition={{
          duration: state === "speak" ? 0.45 : 2,
          repeat: state === "speak" ? Infinity : 0,
        }}
      />

      {/* Frame */}
      <div className="absolute inset-4 rounded-full border border-border-strong bg-gradient-to-br from-elev-1 to-base overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-50" />

        {/* SVG silhouette placeholder */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full"
          fill="none"
        >
          <defs>
            <linearGradient id="face-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF1F44" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Head outline */}
          <motion.ellipse
            cx="100"
            cy="100"
            rx="62"
            ry="78"
            stroke="url(#face-grad)"
            strokeWidth="1.5"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Hair lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M ${60 + i * 5} 45 Q ${75 + i * 4} ${30 - i * 2}, ${90 + i * 5} 50`}
              stroke="url(#face-grad)"
              strokeWidth="1"
              opacity={0.4}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}

          {/* Eyes */}
          <motion.g
            animate={{
              scaleY: state === "think" ? 0.4 : 1,
            }}
            style={{ transformOrigin: "100px 95px" }}
          >
            <circle cx="82" cy="95" r="3" fill="#F5F5F7" />
            <circle cx="118" cy="95" r="3" fill="#F5F5F7" />
            <motion.circle
              cx="82"
              cy="95"
              r="1.5"
              fill="#FF1F44"
              animate={{
                cx: state === "listen" ? [82, 84, 80, 82] : 82,
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.circle
              cx="118"
              cy="95"
              r="1.5"
              fill="#FF1F44"
              animate={{
                cx: state === "listen" ? [118, 120, 116, 118] : 118,
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.g>

          {/* Mouth */}
          <motion.ellipse
            cx="100"
            cy="135"
            rx="14"
            ry="3"
            fill="url(#face-grad)"
            animate={{
              ry: state === "speak" ? [3, 9, 4, 11, 3] : 3,
              rx: state === "speak" ? [14, 12, 14, 13, 14] : state === "think" ? 6 : 14,
            }}
            transition={{
              duration: state === "speak" ? 0.55 : 0.3,
              repeat: state === "speak" ? Infinity : 0,
            }}
          />

          {/* Waveform halo when speaking */}
          {state === "speak" &&
            [...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx="100"
                cy="100"
                r="60"
                stroke="#FF1F44"
                strokeWidth="0.6"
                fill="none"
                initial={{ r: 60, opacity: 0.8 }}
                animate={{ r: 95, opacity: 0 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.6,
                }}
              />
            ))}
        </svg>
      </div>

      {/* State label */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted bg-elev-1 border border-border-subtle px-3 py-1 rounded-full">
          ▮ {state}
        </div>
      </div>
    </div>
  );
}
