import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Nav } from "@/components/Nav";
import { MicButton } from "@/components/console/MicButton";
import { EnginePills } from "@/components/console/EnginePills";
import { TTSPlayer } from "@/components/console/TTSPlayer";
import { VoicePicker } from "@/components/console/VoicePicker";
import { EngineToggles } from "@/components/console/EngineToggles";
import { HistoryRail } from "@/components/console/HistoryRail";
import { JarvisHud } from "@/components/console/JarvisHud";
import { Waveform } from "@/components/console/Waveform";
import { HudPanel } from "@/components/console/HudPanel";
import { useMic } from "@/hooks/useMic";
import { usePipeline } from "@/hooks/usePipeline";
import { Button } from "@/components/ui/button";
import type { CoreState } from "@/components/avatar/JarvisCore";
import type { Source } from "@/lib/api";

export default function Console() {
  const [voice, setVoice] = useState("af_bella");
  const [text, setText] = useState("");
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsLevel, setTtsLevel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pipeline = usePipeline();
  const { state, level, start, stop } = useMic((pcm) => {
    pipeline.sendPcm(pcm);
  });

  useEffect(() => {
    pipeline.connect();
    return () => pipeline.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPress = useCallback(() => {
    pipeline.reset();
    start();
  }, [pipeline, start]);

  const onRelease = useCallback(() => {
    stop();
    pipeline.stopAndFlush({ voice });
  }, [stop, pipeline, voice]);

  const submitText = useCallback(() => {
    if (!text.trim()) return;
    pipeline.sendQuery(text.trim(), { voice });
    setText("");
  }, [text, pipeline, voice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submitText();
        }
        return;
      }
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        onPress();
      }
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") pipeline.reset();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") onRelease();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [onPress, onRelease, submitText, pipeline]);

  const recording = state === "recording";
  const speaking = ttsPlaying;

  // Resolve the single source of truth for the HUD state.
  const hudState: CoreState = useMemo(() => {
    if (speaking) return "speak";
    if (pipeline.state.busy) return "think";
    if (recording) return "listen";
    return "idle";
  }, [speaking, pipeline.state.busy, recording]);

  const hudLevel = speaking ? ttsLevel : level;

  // Caption — what the avatar is "reading" right now.
  const caption = speaking
    ? pipeline.state.answer
    : pipeline.state.busy
      ? pipeline.state.finalText || "synthesizing response..."
      : recording
        ? pipeline.state.partial || "listening..."
        : undefined;

  return (
    <div className="min-h-screen bg-void text-primary">
      <Nav />
      <main className="pt-20 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-[1480px] grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4 lg:gap-6">
          {/* === LEFT RAIL === */}
          <aside className="hidden lg:block space-y-6 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <HistoryRail />
            <EngineToggles />
            <div className="font-mono text-[10px] text-muted leading-relaxed pt-4 border-t border-border-subtle">
              <div className="mb-2 uppercase tracking-[0.18em]">connection</div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    pipeline.state.connected
                      ? "size-1.5 rounded-full bg-mint"
                      : "size-1.5 rounded-full bg-raw animate-pulse"
                  }
                />
                {pipeline.state.connected ? "ws connected" : "ws disconnected"}
              </div>
              {pipeline.state.error && (
                <div className="mt-2 text-raw-glow">{pipeline.state.error}</div>
              )}
            </div>
          </aside>

          {/* === MAIN === */}
          <section className="space-y-6 min-w-0">
            {/* JARVIS HUD — centerpiece */}
            <div className="flex justify-center py-6">
              <JarvisHud state={hudState} level={hudLevel} caption={caption} />
            </div>

            {/* Waveform strip */}
            <div className="rounded-xl border border-border-subtle bg-elev-1/40 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {speaking ? "voice · output" : recording ? "voice · input" : "voice · silent"}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {((speaking ? ttsLevel : level) * 100).toFixed(0)}%
                </span>
              </div>
              <Waveform
                level={speaking ? ttsLevel : level}
                active={speaking || recording}
                color={speaking ? "var(--color-raw-glow)" : "var(--color-cyber)"}
              />
            </div>

            {/* Input + mic */}
            <HudPanel label="input" accent="raw">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-raw">{">"}</span>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="speak · or type · enter sends · / focuses · esc resets"
                  className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-muted font-mono py-2"
                />
                <Button
                  size="sm"
                  variant={text ? "primary" : "ghost"}
                  onClick={submitText}
                  disabled={!text.trim()}
                >
                  Send <Send className="size-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <MicButton
                  active={recording}
                  level={level}
                  onPress={onPress}
                  onRelease={onRelease}
                  disabled={!pipeline.state.connected}
                />
              </div>
            </HudPanel>

            {/* Engines + transcript row */}
            <div className="grid md:grid-cols-2 gap-4">
              <HudPanel label="engines · status" accent="cyber">
                <EnginePills engines={pipeline.state.engines} />
              </HudPanel>
              <HudPanel label="transcript" accent="violet">
                <TranscriptPanelInline
                  partial={pipeline.state.partial}
                  finalText={pipeline.state.finalText}
                />
              </HudPanel>
            </div>

            {/* Answer */}
            <HudPanel label="answer · synthesized" accent="mint">
              <AnswerPaneInline
                answer={pipeline.state.answer}
                sources={pipeline.state.sources}
                confidence={pipeline.state.confidence}
                busy={pipeline.state.busy}
              />
            </HudPanel>

            {/* TTS */}
            {pipeline.state.ttsBlobUrl && (
              <HudPanel label="vocal · output" accent="raw">
                <TTSPlayer
                  blobUrl={pipeline.state.ttsBlobUrl}
                  voice={voice}
                  onPlayingChange={setTtsPlaying}
                  onLevel={setTtsLevel}
                />
              </HudPanel>
            )}
          </section>

          {/* === RIGHT RAIL === */}
          <aside className="hidden lg:block space-y-6 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <VoicePicker selected={voice} onSelect={(v) => setVoice(v.voice)} />
            <div className="font-mono text-[10px] text-muted leading-relaxed pt-4 border-t border-border-subtle">
              <div className="mb-2 uppercase tracking-[0.18em]">hotkeys</div>
              <div className="space-y-1.5">
                <Row k="space" v="push to talk" />
                <Row k="/" v="focus query" />
                <Row k="enter" v="send query" />
                <Row k="esc" v="reset" />
              </div>
            </div>

            {/* HUD chrome detail */}
            <div className="font-mono text-[10px] text-muted leading-relaxed pt-4 border-t border-border-subtle">
              <div className="mb-2 uppercase tracking-[0.18em]">telemetry</div>
              <div className="space-y-1">
                <Row k="state" v={hudState} />
                <Row k="level" v={`${(hudLevel * 100).toFixed(0)}%`} />
                <Row
                  k="conf"
                  v={`${(pipeline.state.confidence * 100).toFixed(0)}%`}
                />
                <Row k="src" v={String(pipeline.state.sources.length)} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// Strip the inner cards from the existing panels since HudPanel wraps now.
function TranscriptPanelInline(props: { partial: string; finalText: string }) {
  return (
    <div className="min-h-[64px]">
      {!props.partial && !props.finalText && (
        <div className="text-muted text-sm italic">
          awaiting voice or typed query
        </div>
      )}
      {props.finalText && (
        <div className="text-primary text-base font-medium leading-relaxed">
          {props.finalText}
        </div>
      )}
      {props.partial && (
        <div className="text-secondary text-base leading-relaxed italic">
          {props.partial}
          <span className="ml-1 inline-block text-raw-glow animate-caret">▮</span>
        </div>
      )}
    </div>
  );
}

function AnswerPaneInline({
  answer,
  sources,
  confidence,
  busy,
}: {
  answer: string;
  sources: Source[];
  confidence: number;
  busy: boolean;
}) {
  const paras = answer ? answer.split("\n\n").filter(Boolean) : [];
  return (
    <div className="min-h-[160px]">
      {confidence > 0 && (
        <div className="mb-3 font-mono text-[11px] text-muted">
          confidence{" "}
          <span className={confidence > 0.5 ? "text-mint" : "text-amber"}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {!answer && !busy && (
        <div className="text-muted text-sm italic">
          the synthesizer will speak here after the search lands.
        </div>
      )}

      {busy && !answer && (
        <div className="font-mono text-cyber text-sm flex items-center gap-3">
          <span className="inline-block size-2 rounded-full bg-cyber animate-pulse" />
          searching · crawling · ranking · synthesizing
        </div>
      )}

      <div className="space-y-3">
        {paras.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="text-primary text-[15px] leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
            sources · {sources.length}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:border-raw/60 transition-colors"
              >
                <span className="font-mono text-[11px] text-muted shrink-0 mt-0.5">
                  [{i + 1}]
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-primary truncate group-hover:text-raw-glow transition-colors">
                    {s.title || s.url}
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    {s.engine} · {s.url}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-primary bg-elev-1 border border-border-subtle px-1.5 py-0.5 rounded text-[10px]">
        {k}
      </span>
      <span>{v}</span>
    </div>
  );
}
