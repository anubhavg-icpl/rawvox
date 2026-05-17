import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { TerminalBlock } from "../terminal/TerminalBlock";
import { cn } from "@/lib/utils";

const tabs = ["cURL", "Python", "TypeScript"] as const;
type Tab = (typeof tabs)[number];

const samples: Record<Tab, string[]> = {
  cURL: [
    `curl -X POST http://localhost:8000/api/search \\`,
    `  -H 'content-type: application/json' \\`,
    `  -d '{"query": "hawking radiation latest research", "deep": true}'`,
  ],
  Python: [
    `import httpx`,
    ``,
    `r = httpx.post(`,
    `    "http://localhost:8000/api/search",`,
    `    json={"query": "hawking radiation latest", "deep": True, "speak": False},`,
    `    timeout=60,`,
    `)`,
    `print(r.json()["answer"])`,
  ],
  TypeScript: [
    `const r = await fetch("/api/search", {`,
    `  method: "POST",`,
    `  headers: { "content-type": "application/json" },`,
    `  body: JSON.stringify({`,
    `    query: "hawking radiation latest",`,
    `    deep: true,`,
    `  }),`,
    `});`,
    `const { answer, sources, confidence } = await r.json();`,
  ],
};

const endpoints = [
  ["POST", "/api/search", "Text query → synthesized answer + sources"],
  ["POST", "/api/transcribe", "Audio file → raw transcription"],
  ["POST", "/api/transcribe-and-search", "Audio file → search → answer"],
  ["POST", "/api/tts", "Text → audio blob (kokoro/edge)"],
  ["GET", "/api/voices", "List available TTS voices"],
  ["GET", "/api/engines", "List + status of search engines"],
  ["WS", "/ws/asr", "Bidi PCM stream → partial/final text"],
  ["WS", "/ws/pipeline", "End-to-end stream: mic → search → tts"],
  ["GET", "/api/search/stream", "SSE: engine + crawl + synth events"],
];

export function ApiSection() {
  const [tab, setTab] = useState<Tab>("cURL");
  return (
    <section id="api" className="relative py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          <div>
            <SectionHeader
              num="05·"
              eyebrow="api"
              title={
                <>
                  REST. Streamed.
                  <br />
                  No middleware.
                </>
              }
              desc="The FastAPI surface is the same one the CLI uses. Use it from any client, embed it in any backend, run it on any port."
            />

            {/* Endpoint table */}
            <div className="mt-10 rounded-lg border border-border-subtle overflow-hidden font-mono text-[12px]">
              {endpoints.map(([method, path, desc], i) => (
                <div
                  key={path}
                  className={cn(
                    "grid grid-cols-[60px_1fr] sm:grid-cols-[60px_240px_1fr] gap-x-4 px-4 py-3 items-baseline",
                    i % 2 === 0 ? "bg-elev-1/40" : "bg-transparent",
                    i < endpoints.length - 1 && "border-b border-border-subtle"
                  )}
                >
                  <span
                    className={cn(
                      "font-semibold",
                      method === "GET" && "text-mint",
                      method === "POST" && "text-cyber",
                      method === "WS" && "text-violet"
                    )}
                  >
                    {method}
                  </span>
                  <span className="text-primary">{path}</span>
                  <span className="text-muted hidden sm:block">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Tabs */}
            <div className="flex gap-1 mb-3 font-mono text-xs">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors",
                    tab === t
                      ? "bg-elev-1 text-primary border border-border-subtle"
                      : "text-muted hover:text-secondary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <TerminalBlock
              title={tab.toLowerCase()}
              lines={samples[tab].map((s) => ({
                text: s,
                tone: s.startsWith("//") || s.startsWith("#") ? "muted" : "primary",
              }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
