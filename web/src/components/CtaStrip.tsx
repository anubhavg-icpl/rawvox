import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function CtaStrip() {
  return (
    <section className="relative py-32 border-t border-border-subtle overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgb(220 38 38 / 0.6) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-5xl md:text-6xl font-bold text-primary leading-tight">
          Stop renting
          <br />
          your <span className="text-gradient-raw">voice</span>.
        </h2>
        <p className="mt-6 text-lg text-secondary">
          Self-host the stack. MIT licensed. Zero telemetry. Your mic, your data,
          your weights.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/console">
            <Button size="lg" variant="primary">
              Open console <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/mranv/rawvox"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="outline">
              View on GitHub
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
