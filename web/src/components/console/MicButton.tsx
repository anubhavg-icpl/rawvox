import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function MicButton({
  active,
  level,
  onPress,
  onRelease,
  disabled,
}: {
  active: boolean;
  level: number; // 0..1
  onPress: () => void;
  onRelease: () => void;
  disabled?: boolean;
}) {
  const scale = 1 + Math.min(0.25, level * 0.5);
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        disabled={disabled}
        onMouseDown={onPress}
        onMouseUp={onRelease}
        onTouchStart={(e) => {
          e.preventDefault();
          onPress();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onRelease();
        }}
        className={cn(
          "relative size-24 rounded-full grid place-items-center transition-all duration-200",
          active
            ? "bg-raw text-white shadow-[var(--shadow-glow-raw)]"
            : "bg-elev-2 text-secondary hover:bg-elev-1 hover:text-primary border border-border-subtle",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        aria-label={active ? "Stop recording" : "Push to talk"}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-raw/30 transition-transform duration-100"
            style={{ transform: `scale(${scale})` }}
          />
        )}
        <span className="relative grid place-items-center">
          {active ? <Square className="size-8 fill-current" /> : <Mic className="size-10" />}
        </span>
      </button>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {active ? "▮ recording · release to send" : "hold to talk · or press space"}
      </span>
    </div>
  );
}
