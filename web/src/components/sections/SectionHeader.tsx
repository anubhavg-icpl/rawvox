import { cn } from "@/lib/utils";

export function SectionHeader({
  num,
  eyebrow,
  title,
  desc,
  className,
}: {
  num: string;
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-xs text-raw">{num}</span>
        <span className="h-px flex-1 bg-border-subtle max-w-12" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary leading-[1.05]">
        {title}
      </h2>
      {desc && (
        <p className="mt-5 text-base md:text-lg text-secondary leading-relaxed">
          {desc}
        </p>
      )}
    </div>
  );
}
