import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

const lines = [
  { p: "$", c: "git clone https://github.com/mranv/rawvox && cd rawvox" },
  { p: "$", c: "pip install -r requirements.txt" },
  { p: "$", c: "python main.py live", hl: true },
];

const boot = [
  "[ASR] Loading large-v3 on cuda · int8",
  "[ASR] Model loaded successfully",
  "[Search] engines: duckduckgo, brave, mojeek, searxng",
  "[TTS]   Voice: af_bella · backend: kokoro",
  "▮ Listening...",
];

export function CLIInstall() {
  const [bootShown, setBootShown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (bootShown >= boot.length) return;
    const t = setTimeout(() => setBootShown((n) => n + 1), 350);
    return () => clearTimeout(t);
  }, [bootShown]);

  const copy = () => {
    navigator.clipboard.writeText(
      "git clone https://github.com/mranv/rawvox && cd rawvox && pip install -r requirements.txt && python main.py live"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative font-mono text-[13px] leading-relaxed">
      <div className="rounded-xl border border-border-subtle bg-elev-1/80 backdrop-blur-md shadow-[var(--shadow-elev-2)] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 h-9 border-b border-border-subtle bg-base/60">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-muted text-xs">rawvox · zsh</span>
          <button
            onClick={copy}
            className="text-muted hover:text-primary transition-colors"
            aria-label="Copy install command"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-1.5 min-h-[280px]">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-raw select-none">{l.p}</span>
              <span className={l.hl ? "text-primary" : "text-secondary"}>
                {l.c}
              </span>
            </div>
          ))}

          <div className="h-3" />

          {boot.slice(0, bootShown).map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("▮")
                  ? "text-raw-glow"
                  : line.startsWith("[ASR]")
                    ? "text-cyber"
                    : line.startsWith("[Search]")
                      ? "text-violet"
                      : line.startsWith("[TTS]")
                        ? "text-mint"
                        : "text-secondary"
              }
            >
              {line}
              {i === boot.length - 1 && (
                <span className="text-raw-glow animate-caret ml-1">▮</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
