const cols = [
  {
    title: "Product",
    links: [
      ["Console", "/console"],
      ["Voices", "#voices"],
      ["API", "#api"],
      ["Self-host", "#deploy"],
    ],
  },
  {
    title: "Engine",
    links: [
      ["ASR · whisper", "#engine"],
      ["Search · 4 sources", "#search"],
      ["Synth · MiniLM", "#"],
      ["TTS · kokoro", "#voices"],
    ],
  },
  {
    title: "Open Source",
    links: [
      ["GitHub", "https://github.com/mranv/rawvox"],
      ["MIT License", "https://github.com/mranv/rawvox/blob/master/LICENSE"],
      ["Issues", "https://github.com/mranv/rawvox/issues"],
      ["Releases", "https://github.com/mranv/rawvox/releases"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border-subtle bg-base/40">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="font-mono text-base font-semibold mb-3">
              <span className="text-primary">Raw</span>
              <span className="text-raw">Vox</span>
              <span className="text-raw-glow animate-caret">▮</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Uncensored AI ASR + deep search + seductive voice. MIT. No
              telemetry.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-secondary hover:text-primary transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted">
          <span>© 2026 RawVox · MIT · no tracking · no API keys</span>
          <span>built with whisper · kokoro · MiniLM · rust httpx</span>
        </div>
      </div>
    </footer>
  );
}
