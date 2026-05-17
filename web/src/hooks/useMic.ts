import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Captures mic input as 16kHz int16 PCM chunks, ~250ms each.
 * Emits raw PCM bytes via onPcm callback. Also exposes a level (0..1).
 */

export type MicState = "idle" | "starting" | "recording" | "error";

const TARGET_SR = 16000;

export function useMic(onPcm: (pcm: Int16Array) => void) {
  const [state, setState] = useState<MicState>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const onPcmRef = useRef(onPcm);
  onPcmRef.current = onPcm;

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setState("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: TARGET_SR });
      ctxRef.current = ctx;

      // Inline worklet — downsamples (browser may already be at 16k) and posts int16.
      const workletCode = `
        class PCM16Processor extends AudioWorkletProcessor {
          constructor() {
            super();
            this._buf = [];
            this._target = 4000; // 250ms @ 16k
          }
          process(inputs) {
            const ch = inputs[0]?.[0];
            if (!ch) return true;
            for (let i = 0; i < ch.length; i++) {
              const s = Math.max(-1, Math.min(1, ch[i]));
              this._buf.push(s < 0 ? s * 0x8000 : s * 0x7fff);
            }
            while (this._buf.length >= this._target) {
              const out = new Int16Array(this._target);
              for (let i = 0; i < this._target; i++) out[i] = this._buf[i] | 0;
              this._buf.splice(0, this._target);
              this.port.postMessage(out, [out.buffer]);
            }
            return true;
          }
        }
        registerProcessor('pcm16', PCM16Processor);
      `;
      const blob = new Blob([workletCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const source = ctx.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(ctx, "pcm16");
      node.port.onmessage = (e) => onPcmRef.current(e.data as Int16Array);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);
      source.connect(node);

      // Level loop
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 4));
        raf = requestAnimationFrame(tick);
      };
      tick();
      (node as any)._raf = raf;

      nodeRef.current = node;
      setState("recording");
    } catch (e: any) {
      setError(e.message ?? "mic error");
      setState("error");
    }
  }, []);

  const stop = useCallback(() => {
    if (nodeRef.current && (nodeRef.current as any)._raf) {
      cancelAnimationFrame((nodeRef.current as any)._raf);
    }
    nodeRef.current?.disconnect();
    nodeRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setLevel(0);
    setState("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { state, level, error, start, stop };
}
