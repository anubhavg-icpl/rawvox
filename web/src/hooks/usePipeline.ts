import { useCallback, useEffect, useRef, useState } from "react";
import { wsUrl } from "@/lib/api";

export type EngineStatus = "idle" | "running" | "done" | "error";

export type PipelineState = {
  connected: boolean;
  partial: string;
  finalText: string;
  engines: Record<string, { status: EngineStatus; count?: number; error?: string }>;
  sources: Array<{ title: string; url: string; snippet?: string; engine?: string }>;
  answer: string;
  confidence: number;
  ttsBlobUrl: string | null;
  busy: boolean;
  error: string | null;
};

const initial: PipelineState = {
  connected: false,
  partial: "",
  finalText: "",
  engines: {},
  sources: [],
  answer: "",
  confidence: 0,
  ttsBlobUrl: null,
  busy: false,
  error: null,
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>(initial);
  const wsRef = useRef<WebSocket | null>(null);
  const ttsChunksRef = useRef<Uint8Array[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= 1) return;
    const ws = new WebSocket(wsUrl("/ws/pipeline"));
    ws.binaryType = "arraybuffer";

    ws.onopen = () => setState((s) => ({ ...s, connected: true, error: null }));
    ws.onclose = () => setState((s) => ({ ...s, connected: false }));
    ws.onerror = () =>
      setState((s) => ({ ...s, error: "ws error", connected: false }));

    ws.onmessage = (e) => {
      let evt: any;
      try {
        evt = JSON.parse(e.data);
      } catch {
        return;
      }
      setState((s) => reduce(s, evt, ttsChunksRef));
    };

    wsRef.current = ws;
  }, []);

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify(data));
  }, []);

  const sendPcm = useCallback((pcm: Int16Array) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(pcm.buffer);
  }, []);

  const sendQuery = useCallback(
    (text: string) => {
      ttsChunksRef.current = [];
      setState((s) => ({
        ...s,
        busy: true,
        partial: "",
        finalText: text,
        engines: {},
        sources: [],
        answer: "",
        confidence: 0,
        ttsBlobUrl: null,
        error: null,
      }));
      send({ type: "query", text });
    },
    [send]
  );

  const stopAndFlush = useCallback(() => {
    ttsChunksRef.current = [];
    setState((s) => ({ ...s, busy: true }));
    send({ type: "stop" });
  }, [send]);

  const reset = useCallback(() => {
    ttsChunksRef.current = [];
    setState(initial);
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return { state, connect, disconnect, sendPcm, sendQuery, stopAndFlush, reset };
}

function reduce(
  s: PipelineState,
  evt: any,
  ttsChunksRef: React.MutableRefObject<Uint8Array[]>
): PipelineState {
  switch (evt.type) {
    case "asr.partial":
      return { ...s, partial: evt.text };
    case "asr.final":
      return { ...s, finalText: evt.text, partial: "", busy: true };
    case "engine.start":
      return {
        ...s,
        engines: Object.fromEntries((evt.engines ?? []).map((n: string) => [n, { status: "idle" }])),
      };
    case "engine.running":
      return { ...s, engines: { ...s.engines, [evt.name]: { status: "running" } } };
    case "engine.done":
      return {
        ...s,
        engines: {
          ...s.engines,
          [evt.name]: { status: "done", count: evt.count },
        },
      };
    case "engine.error":
      return {
        ...s,
        engines: {
          ...s.engines,
          [evt.name]: { status: "error", error: evt.error },
        },
      };
    case "crawl.done":
      // optional: could populate sources progressively
      return s;
    case "answer":
      return {
        ...s,
        answer: evt.answer,
        sources: evt.sources,
        confidence: evt.confidence,
      };
    case "tts.chunk": {
      const raw = atob(evt.audio);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      ttsChunksRef.current.push(bytes);
      if (evt.final) {
        const total = ttsChunksRef.current.reduce((n, b) => n + b.length, 0);
        const combined = new Uint8Array(total);
        let o = 0;
        for (const b of ttsChunksRef.current) {
          combined.set(b, o);
          o += b.length;
        }
        const blob = new Blob([combined as BlobPart], { type: `audio/${evt.format ?? "wav"}` });
        const url = URL.createObjectURL(blob);
        return { ...s, ttsBlobUrl: url };
      }
      return s;
    }
    case "done":
      return { ...s, busy: false };
    case "tts.error":
    case "error":
      return { ...s, busy: false, error: evt.message ?? "unknown" };
    default:
      return s;
  }
}
