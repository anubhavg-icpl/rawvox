import { motion } from "framer-motion";

export type RingState = "idle" | "listen" | "think" | "speak";

const STATE_COLOR: Record<RingState, string> = {
  idle: "rgba(220, 38, 38, 0.35)",
  listen: "rgba(0, 229, 255, 0.7)",
  think: "rgba(139, 92, 246, 0.7)",
  speak: "rgba(255, 31, 68, 0.85)",
};

/**
 * Concentric rotating rings overlayed around the JarvisCore.
 * Pure SVG — no GPU cost. Rotation speed reacts to state.
 */
export function JarvisRings({
  state,
  level = 0,
}: {
  state: RingState;
  level?: number;
}) {
  const color = STATE_COLOR[state];
  const speedMult =
    state === "speak" ? 1.6 + level * 2 : state === "think" ? 1.3 : 1;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="r-glow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor={color} stopOpacity="0" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="195" fill="url(#r-glow)" />

        {/* Outer ring — tick marks */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60 / speedMult, repeat: Infinity, ease: "linear" }}
          style={{ originX: "200px", originY: "200px" }}
        >
          <circle
            cx="200"
            cy="200"
            r="188"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            strokeDasharray="2 6"
          />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const isMajor = i % 6 === 0;
            const x1 = 200 + Math.cos(a) * 178;
            const y1 = 200 + Math.sin(a) * 178;
            const x2 = 200 + Math.cos(a) * (isMajor ? 168 : 174);
            const y2 = 200 + Math.sin(a) * (isMajor ? 168 : 174);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={isMajor ? 1.4 : 0.6}
              />
            );
          })}
        </motion.g>

        {/* Middle ring — dashed arc broken into 4 quadrants */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 28 / speedMult, repeat: Infinity, ease: "linear" }}
          style={{ originX: "200px", originY: "200px" }}
        >
          {[0, 90, 180, 270].map((a) => (
            <path
              key={a}
              d={describeArc(200, 200, 156, a + 5, a + 70)}
              fill="none"
              stroke={color}
              strokeWidth="1.2"
            />
          ))}
          {[45, 135, 225, 315].map((a) => (
            <circle
              key={a}
              cx={200 + Math.cos((a * Math.PI) / 180) * 156}
              cy={200 + Math.sin((a * Math.PI) / 180) * 156}
              r="2.2"
              fill={color}
            />
          ))}
        </motion.g>

        {/* Inner ring — segmented arc + chevrons */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 14 / speedMult, repeat: Infinity, ease: "linear" }}
          style={{ originX: "200px", originY: "200px" }}
        >
          <circle
            cx="200"
            cy="200"
            r="128"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="14 4 4 4"
            opacity="0.7"
          />
          {[0, 120, 240].map((a) => (
            <polygon
              key={a}
              points="-6,-3 6,0 -6,3"
              fill={color}
              transform={`translate(${200 + Math.cos((a * Math.PI) / 180) * 128} ${200 + Math.sin((a * Math.PI) / 180) * 128}) rotate(${a})`}
            />
          ))}
        </motion.g>

        {/* Corner reticles */}
        {[
          { x: 20, y: 20, r: 0 },
          { x: 380, y: 20, r: 90 },
          { x: 380, y: 380, r: 180 },
          { x: 20, y: 380, r: 270 },
        ].map((c) => (
          <g key={`${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}>
            <path
              d="M 0 -14 L 0 0 L 14 0"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// --- helpers ---
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}
