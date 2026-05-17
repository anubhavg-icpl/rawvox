import { cn } from "@/lib/utils";

/**
 * Wrapper that gives any child the Jarvis HUD panel look:
 * corner brackets, monospace label, faint background, subtle border.
 */
export function HudPanel({
  label,
  children,
  className,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  accent?: "cyber" | "violet" | "raw" | "mint" | "muted";
}) {
  const accentColor = {
    cyber: "var(--color-cyber)",
    violet: "var(--color-violet)",
    raw: "var(--color-raw-glow)",
    mint: "var(--color-mint)",
    muted: "var(--color-muted)",
  }[accent ?? "muted"];

  return (
    <div className={cn("relative", className)}>
      {/* Corner brackets */}
      {[
        "top-0 left-0",
        "top-0 right-0 rotate-90",
        "bottom-0 right-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("absolute size-3 pointer-events-none", pos)}
          style={{
            borderTop: `1.5px solid ${accentColor}`,
            borderLeft: `1.5px solid ${accentColor}`,
          }}
        />
      ))}

      <div className="rounded-lg border border-border-subtle bg-elev-1/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 pt-3">
          <span
            className="size-1 rounded-full"
            style={{ background: accentColor }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          <span className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
