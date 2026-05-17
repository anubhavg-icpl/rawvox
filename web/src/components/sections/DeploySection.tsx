import { SectionHeader } from "./SectionHeader";
import { TerminalBlock } from "../terminal/TerminalBlock";

const topo = String.raw`
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  browser     │ ──▶ │  FastAPI      │ ──▶ │  whisper     │
│  /console    │ ◀── │  uvicorn:8000 │ ◀── │  cuda · int8 │
└──────────────┘     └───────┬───────┘     └──────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ duckduck │ │  brave   │ │ searxng  │
         │ html     │ │  html    │ │ :8888    │
         └──────────┘ └──────────┘ └──────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │  kokoro / edge│
                     │  bella voice  │
                     └───────────────┘
`;

export function DeploySection() {
  return (
    <section
      id="deploy"
      className="relative py-32 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <SectionHeader
              num="06·"
              eyebrow="self-host"
              title={
                <>
                  One repo.
                  <br />
                  One container.
                </>
              }
              desc="Clone, compose, ship. SearXNG ships in the same compose file. NVIDIA runtime auto-detected. No API keys to register. No accounts to create."
            />

            <TerminalBlock
              className="mt-10"
              title="install · zsh"
              lines={[
                { prefix: "$", text: "git clone https://github.com/mranv/rawvox", tone: "primary" },
                { prefix: "$", text: "cd rawvox", tone: "primary" },
                { prefix: "$", text: "docker compose up -d", tone: "primary" },
                { text: "", tone: "muted" },
                { text: "✓ searxng    started on :8888", tone: "mint" },
                { text: "✓ rawvox     started on :8000", tone: "mint" },
                { text: "", tone: "muted" },
                { text: "→ open http://localhost:8000", tone: "cyber" },
              ]}
            />
          </div>

          <div>
            <div className="rounded-xl border border-border-subtle bg-elev-1/60 p-6">
              <div className="font-mono text-xs text-muted mb-2 uppercase tracking-wider">
                topology
              </div>
              <pre className="font-mono text-[11px] sm:text-[12px] leading-snug text-secondary whitespace-pre overflow-x-auto">
                {topo}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
