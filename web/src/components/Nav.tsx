import { Link } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "./ui/button";

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border-subtle/60 backdrop-blur-xl bg-void/70">
      <div className="mx-auto max-w-[1280px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-mono text-base font-semibold tracking-tight">
            <span className="text-primary">Raw</span>
            <span className="text-raw">Vox</span>
            <span className="text-raw-glow animate-caret">▮</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-secondary">
          <Link to="/console" className="hover:text-primary transition-colors">
            Console
          </Link>
          <a href="#engine" className="hover:text-primary transition-colors">
            Engine
          </a>
          <a href="#search" className="hover:text-primary transition-colors">
            Search
          </a>
          <a href="#voices" className="hover:text-primary transition-colors">
            Voices
          </a>
          <a href="#api" className="hover:text-primary transition-colors">
            API
          </a>
          <a href="#deploy" className="hover:text-primary transition-colors">
            Self-host
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/mranv/rawvox"
            target="_blank"
            rel="noreferrer"
            className="text-secondary hover:text-primary transition-colors"
            aria-label="GitHub"
          >
            <Github className="size-5" />
          </a>
          <Link to="/console">
            <Button size="sm" variant="primary">
              Start <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
