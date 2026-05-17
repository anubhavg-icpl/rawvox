import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Aurora } from "./Aurora";
import { CLIInstall } from "./CLIInstall";
import { RiveFace } from "./RiveFace";
import { Button } from "../ui/button";

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const chips = [
  { dot: "var(--color-cyber)", label: "faster-whisper" },
  { dot: "var(--color-mint)", label: "kokoro-82M" },
  { dot: "var(--color-violet)", label: "4 engines" },
  { dot: "var(--color-raw-glow)", label: "self-host" },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden noise">
      <Aurora />

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/* Eyebrow */}
        <motion.div
          {...fade}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="size-1.5 rounded-full bg-raw animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            uncensored · multi-engine · self-host
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.h1
              {...fade}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-bold text-primary"
            >
              Your voice.
              <br />
              The raw web.
              <br />
              <span className="text-gradient-raw">Synthesized.</span>
            </motion.h1>

            <motion.p
              {...fade}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-lg text-secondary max-w-xl"
            >
              Speak. Search. Hear back. No filters, no API keys, no tracking.
              An end-to-end pipeline: real-time ASR, multi-engine deep crawl,
              semantic synthesis, and a seductive voice that whispers it back.
            </motion.p>

            <motion.div
              {...fade}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link to="/console">
                <Button size="lg" variant="primary">
                  Start console <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#engine">
                <Button size="lg" variant="outline">
                  <BookOpen className="size-4" /> Read docs
                </Button>
              </a>
            </motion.div>

            <motion.div
              {...fade}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              {chips.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-secondary"
                >
                  <span
                    className="size-2 rounded-sm"
                    style={{ background: c.dot }}
                  />
                  {c.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: face + CLI */}
          <motion.div
            {...fade}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative space-y-6"
          >
            <RiveFace />
            <CLIInstall />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
