import { SectionHeader } from "./SectionHeader";
import { Check, X } from "lucide-react";

const engines = [
  {
    name: "DuckDuckGo",
    handle: "duckduckgo",
    desc: "HTML scrape · uddg-decoded · no API key",
    color: "var(--color-amber)",
  },
  {
    name: "Brave",
    handle: "brave",
    desc: "Independent index · safesearch=off",
    color: "var(--color-raw)",
  },
  {
    name: "Mojeek",
    handle: "mojeek",
    desc: "Privacy-first crawler · UK · no tracking",
    color: "var(--color-cyber)",
  },
  {
    name: "SearXNG",
    handle: "searxng",
    desc: "Self-hosted meta · safesearch=0 · BYO instance",
    color: "var(--color-violet)",
  },
];

const matrix = [
  ["Safe-search filter", false],
  ["Required API key", false],
  ["Per-query log retention", false],
  ["Result re-ranking by ad bid", false],
  ["Deep crawl of top N pages", true],
  ["URL dedupe across engines", true],
];

export function SearchSection() {
  return (
    <section id="search" className="relative py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHeader
          num="02·"
          eyebrow="deep search"
          title={
            <>
              Four engines.
              <br />
              Zero filters.
            </>
          }
          desc="Parallel queries across uncensored sources. URL-dedupe. Top results crawled in full and text-extracted before they ever reach the synthesizer."
        />

        {/* Engine grid */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {engines.map((e) => (
            <div
              key={e.handle}
              className="group relative p-6 rounded-xl border border-border-subtle bg-elev-1/60 hover:border-border-strong transition-colors"
            >
              <div
                className="size-2 rounded-full mb-5"
                style={{ background: e.color, boxShadow: `0 0 12px ${e.color}` }}
              />
              <div className="font-display text-xl text-primary mb-1">
                {e.name}
              </div>
              <div className="font-mono text-xs text-muted mb-4">
                {e.handle}
              </div>
              <div className="text-sm text-secondary leading-relaxed">
                {e.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Filter matrix */}
        <div className="mt-12 grid sm:grid-cols-2 gap-x-12 gap-y-3 max-w-3xl">
          {matrix.map(([label, on]) => (
            <div
              key={label as string}
              className="flex items-center gap-3 text-sm border-b border-border-subtle py-3"
            >
              <span
                className={
                  on
                    ? "text-mint shrink-0 size-5 grid place-items-center"
                    : "text-raw shrink-0 size-5 grid place-items-center"
                }
              >
                {on ? <Check className="size-4" /> : <X className="size-4" />}
              </span>
              <span className="text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
