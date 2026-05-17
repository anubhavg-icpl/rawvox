import { useEffect, useRef, useState } from "react";

/**
 * Attach an AnalyserNode to an <audio> element and continuously
 * expose its RMS amplitude (0..1). Used to drive the AsciiHead mouth.
 */
export function useAudioLevel(audioEl: HTMLAudioElement | null) {
  const [level, setLevel] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioEl) return;

    let ctx: AudioContext;
    try {
      ctx = new AudioContext();
    } catch {
      return;
    }
    ctxRef.current = ctx;

    // createMediaElementSource can only be called once per element.
    let source: MediaElementAudioSourceNode;
    try {
      source = ctx.createMediaElementSource(audioEl);
    } catch {
      return;
    }
    sourceRef.current = source;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    analyserRef.current = analyser;

    source.connect(analyser);
    source.connect(ctx.destination); // keep audible

    const buf = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setLevel(Math.min(1, rms * 5));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    const resume = () => ctx.resume().catch(() => {});
    audioEl.addEventListener("play", resume);

    return () => {
      audioEl.removeEventListener("play", resume);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {}
      ctx.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      setLevel(0);
    };
  }, [audioEl]);

  return level;
}
