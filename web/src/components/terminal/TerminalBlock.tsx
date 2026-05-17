import { cn } from "@/lib/utils";

export type TermLine = {
  prefix?: string;
  text: string;
  tone?: "muted" | "cyber" | "raw" | "mint" | "violet" | "amber" | "primary";
  bold?: boolean;
};

const toneClass: Record<NonNullable<TermLine["tone"]>, string> = {
  muted: "text-muted",
  cyber: "text-cyber",
  raw: "text-raw-glow",
  mint: "text-mint",
  violet: "text-violet",
  amber: "text-amber",
  primary: "text-primary",
};

export function TerminalBlock({
  title = "rawvox · zsh",
  lines,
  className,
  showCaret = false,
}: {
  title?: string;
  lines: TermLine[];
  className?: string;
  showCaret?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-elev-1/70 backdrop-blur-md shadow-[var(--shadow-elev-1)] overflow-hidden font-mono text-[13px] leading-relaxed",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-9 border-b border-border-subtle bg-base/60">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-muted text-xs">{title}</span>
        <span className="size-2.5" />
      </div>
      <div className="p-5 space-y-1.5">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3">
            {l.prefix && (
              <span className="text-raw select-none shrink-0">{l.prefix}</span>
            )}
            <span
              className={cn(
                toneClass[l.tone ?? "muted"],
                l.bold && "font-medium"
              )}
            >
              {l.text}
            </span>
          </div>
        ))}
        {showCaret && (
          <span className="inline-block text-raw-glow animate-caret">▮</span>
        )}
      </div>
    </div>
  );
}
