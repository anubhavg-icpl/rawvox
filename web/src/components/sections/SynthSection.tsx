import { SectionHeader } from "./SectionHeader";

const pipeline = [
  { label: "chunk", sub: "512 char" },
  { label: "embed", sub: "MiniLM-L6" },
  { label: "rank", sub: "cos sim" },
  { label: "filter", sub: "score > .15" },
  { label: "synth", sub: "top 10 join" },
];

export function SynthSection() {
  return (
    <section className="relative py-32 border-t border-border-subtle bg-gradient-to-b from-transparent via-base/40 to-transparent">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHeader
          num="03·"
          eyebrow="synthesizer"
          title={
            <>
              Semantic ranking
              <br />
              over raw web text.
            </>
          }
          desc="No proprietary LLM in the loop. all-MiniLM-L6-v2 embeds your query and every chunk. Cosine similarity ranks them. Top facts are concatenated, with provenance, into a single readable answer."
        />

        {/* Pipeline diagram */}
        <div className="mt-14 overflow-x-auto">
          <div className="min-w-[720px] flex items-center justify-between gap-2 font-mono">
            {pipeline.map((node, i) => (
              <div key={node.label} className="flex items-center gap-2 flex-1">
                <div className="flex-1 rounded-lg border border-border-subtle bg-elev-1/70 p-5 text-center">
                  <div className="text-primary text-base font-semibold">
                    {node.label}
                  </div>
                  <div className="text-muted text-[11px] mt-1 uppercase tracking-wider">
                    {node.sub}
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <span className="text-raw text-xl shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 grid sm:grid-cols-3 gap-6">
          {[
            { num: "0.15", label: "min cosine threshold" },
            { num: "15", label: "top-K candidate chunks" },
            { num: "10", label: "facts joined into answer" },
          ].map((s) => (
            <div
              key={s.label}
              className="border-l-2 border-raw/60 pl-5 py-2"
            >
              <div className="font-display text-4xl font-bold text-primary">
                {s.num}
              </div>
              <div className="text-sm text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
