import { Pause, Play, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAudioLevel } from "@/hooks/useAudioLevel";

export function TTSPlayer({
  blobUrl,
  voice,
  onPlayingChange,
  onLevel,
}: {
  blobUrl: string | null;
  voice: string;
  onPlayingChange?: (playing: boolean) => void;
  onLevel?: (level: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Capture the element once mounted (refs don't trigger renders).
  useEffect(() => {
    if (audioRef.current) setAudioEl(audioRef.current);
  }, []);

  const level = useAudioLevel(playing ? audioEl : null);
  useEffect(() => {
    onLevel?.(playing ? level : 0);
  }, [level, playing, onLevel]);

  useEffect(() => {
    if (!blobUrl) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    a.src = blobUrl;
    a.play().catch(() => {});
  }, [blobUrl]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-elev-1/60 p-4">
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setProgress(a.duration > 0 ? a.currentTime / a.duration : 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          setProgress(1);
        }}
      />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          disabled={!blobUrl}
          className="size-11 rounded-full bg-raw text-white grid place-items-center hover:bg-raw-glow transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[var(--shadow-glow-raw)]"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="size-5 fill-current translate-x-px" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-secondary">
              voice · <span className="text-primary">{voice}</span>
              {playing && (
                <span className="ml-2 text-mint">
                  ▮ level {(level * 100).toFixed(0)}%
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-muted">
              {fmt(progress * duration)} / {fmt(duration)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-elev-2 overflow-hidden">
            <div
              className="h-full bg-raw transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {blobUrl && (
          <a
            href={blobUrl}
            download="rawvox.wav"
            className="size-10 rounded-lg border border-border-subtle text-secondary hover:text-primary hover:border-border-strong grid place-items-center transition-colors"
            aria-label="Download audio"
          >
            <Download className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}
