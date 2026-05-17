/**
 * RawVox API client. Base URL set via VITE_API_BASE; defaults to same-origin
 * (which works in prod static-mount and in dev via vite proxy).
 */

const BASE = import.meta.env.VITE_API_BASE ?? "";

export type Voice = {
  voice: string;
  backend: string;
  grade: string;
  style: string;
};

export type Engine = {
  id: string;
  name: string;
  enabled: boolean;
};

export type Source = {
  title: string;
  url: string;
  engine?: string;
  snippet?: string;
};

export type SearchAnswer = {
  query: string;
  answer: string;
  sources: Source[];
  confidence: number;
};

export type TranscriptStub = {
  id: string;
  timestamp: string;
  query: string;
  confidence: number;
};

async function jget<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function jpost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export const api = {
  health: () => jget<{ status: string }>("/api/health"),
  config: () => jget<any>("/api/config"),
  voices: () => jget<{ voices: Voice[] }>("/api/voices"),
  engines: () => jget<{ engines: Engine[] }>("/api/engines"),
  search: (query: string, deep = true) =>
    jpost<SearchAnswer>("/api/search", { query, deep, speak: false }),
  transcripts: () =>
    jget<{ transcripts: TranscriptStub[] }>("/api/transcripts"),

  async tts(text: string, voice?: string, speed?: number): Promise<Blob> {
    const r = await fetch(`${BASE}/api/tts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, voice, speed, format: "wav" }),
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.blob();
  },
};

/**
 * SSE wrapper around POST /api/search/stream.
 * EventSource doesn't allow POST, so we hand-roll fetch + reader.
 */
export async function searchStream(
  query: string,
  opts: { deep?: boolean; signal?: AbortSignal },
  onEvent: (evt: any) => void
) {
  const r = await fetch(`${BASE}/api/search/stream`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, deep: opts.deep ?? true, speak: false }),
    signal: opts.signal,
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  if (!r.body) throw new Error("no stream body");

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n\n");
    buf = lines.pop() ?? "";
    for (const block of lines) {
      const line = block.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      try {
        onEvent(JSON.parse(payload));
      } catch {
        /* skip malformed */
      }
    }
  }
}

export function wsUrl(path: string) {
  if (BASE) return BASE.replace(/^http/, "ws") + path;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}${path}`;
}
