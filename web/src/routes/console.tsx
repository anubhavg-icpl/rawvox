import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Nav } from "@/components/Nav";
import { MicButton } from "@/components/console/MicButton";
import { TranscriptPanel } from "@/components/console/TranscriptPanel";
import { EnginePills } from "@/components/console/EnginePills";
import { AnswerPane } from "@/components/console/AnswerPane";
import { TTSPlayer } from "@/components/console/TTSPlayer";
import { VoicePicker } from "@/components/console/VoicePicker";
import { EngineToggles } from "@/components/console/EngineToggles";
import { HistoryRail } from "@/components/console/HistoryRail";
import { ConsoleAvatar } from "@/components/avatar/ConsoleAvatar";
import { useMic } from "@/hooks/useMic";
import { usePipeline } from "@/hooks/usePipeline";
import { Button } from "@/components/ui/button";

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
    pipeline.stopAndFlush();
  }, [stop, pipeline]);

  const submitText = useCallback(() => {
    if (!text.trim()) return;
    pipeline.sendQuery(text.trim());
    setText("");
  }, [text, pipeline]);

  // hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
      if (e.key === "Escape") {
        pipeline.reset();
      }
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
  const avatarLevel = speaking ? ttsLevel : level;

  return (
    <div className="min-h-screen bg-void text-primary">
      <Nav />
      <main className="pt-20 pb-10 px-4 md:px-6">
        <div className="mx-auto max-w-[1480px] grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4 lg:gap-6">
          {/* Left rail */}
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

          {/* Main */}
          <section className="space-y-5 min-w-0">
            <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
              <TranscriptPanel
                partial={pipeline.state.partial}
                finalText={pipeline.state.finalText}
              />
              <div className="hidden sm:block">
                <ConsoleAvatar
                  busy={pipeline.state.busy}
                  speaking={speaking}
                  level={avatarLevel}
                />
              </div>
            </div>

            <EnginePills engines={pipeline.state.engines} />

            <AnswerPane
              answer={pipeline.state.answer}
              sources={pipeline.state.sources}
              confidence={pipeline.state.confidence}
              busy={pipeline.state.busy}
            />

            {pipeline.state.ttsBlobUrl && (
              <TTSPlayer
                blobUrl={pipeline.state.ttsBlobUrl}
                voice={voice}
                onPlayingChange={setTtsPlaying}
                onLevel={setTtsLevel}
              />
            )}

            {/* Input row */}
            <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-elev-1/60 p-2 pl-4">
              <span className="font-mono text-raw">{">"}</span>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a query · or press space to talk · / to focus · esc to reset"
                className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-muted font-mono"
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

            <div className="flex justify-center pt-4">
              <MicButton
                active={recording}
                level={level}
                onPress={onPress}
                onRelease={onRelease}
                disabled={!pipeline.state.connected}
              />
            </div>
          </section>

          {/* Right rail */}
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
          </aside>
        </div>
      </main>
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
