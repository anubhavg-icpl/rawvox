import { SectionHeader } from "./SectionHeader";
import { TerminalBlock } from "../terminal/TerminalBlock";

export function EngineSection() {
  return (
    <section id="engine" className="relative py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <SectionHeader
              num="01·"
              eyebrow="asr engine"
              title={
                <>
                  Whisper, raw.
                  <br />
                  No VAD filter, no censor pass.
                </>
              }
              desc="faster-whisper large-v3 streams from your mic in 5-second chunks. Word-level timestamps. 99 languages auto-detected. CUDA when present, CPU when not."
            />
            <ul className="mt-10 space-y-3 text-secondary text-sm">
              {[
                ["large-v3", "Default model, 1.5B params"],
                ["int8 / float16", "Compute-type per device"],
                ["beam_size: 5", "Quality > latency tradeoff"],
                ["VAD off", "Captures every sound, every word"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 items-baseline">
                  <span className="font-mono text-cyber min-w-[140px]">
                    {k}
                  </span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <TerminalBlock
            title="src/asr/engine.py"
            lines={[
              { prefix: "$", text: "python main.py live", tone: "primary" },
              { text: "[ASR] Loading model: large-v3 on cuda (int8)", tone: "cyber" },
              { text: "[ASR] Model loaded successfully", tone: "mint" },
              { text: "[ASR] Starting audio capture at 16000Hz", tone: "muted" },
              { text: "[ASR] Listening... (Ctrl+C to stop)", tone: "muted" },
              { text: "", tone: "muted" },
              { text: "[ASR] Partial: how does", tone: "secondary" as any },
              { text: "[ASR] Partial: how does a black hole", tone: "secondary" as any },
              { text: "[ASR] Partial: how does a black hole emit hawking", tone: "secondary" as any },
              { text: "[ASR] Final: how does a black hole emit hawking radiation", tone: "raw", bold: true },
            ]}
            showCaret
          />
        </div>
      </div>
    </section>
  );
}
