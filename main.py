#!/usr/bin/env python3
"""
Uncensored AI ASR + Deep Web Search CLI.
Usage:
  python main.py live              # Real-time mic input → search → response
  python main.py query "your text" # Direct text query
  python main.py file audio.wav    # Transcribe audio file → search → response
  python main.py search "your text" # Deep search only (no ASR/TTS)
"""

import asyncio
import sys
from pathlib import Path

import click
import yaml
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from src.pipeline.orchestrator import Pipeline

console = Console()


def load_config(path: str = "config/settings.yaml") -> dict:
    config_file = Path(path)
    if config_file.exists():
        with open(config_file) as f:
            return yaml.safe_load(f)
    return {}


@click.group()
@click.option("--config", default="config/settings.yaml", help="Config file path")
@click.pass_context
def cli(ctx, config):
    """Uncensored AI ASR + Deep Web Search Pipeline"""
    ctx.ensure_object(dict)
    ctx.obj["config_path"] = config
    ctx.obj["pipeline"] = Pipeline(config)


@cli.command()
@click.pass_context
def live(ctx):
    """Real-time mic input: speak → search → respond (continuous)"""
    pipeline = ctx.obj["pipeline"]

    console.print(Panel.fit(
        "[bold red]UNCENSORED AI ASR + DEEP SEARCH[/bold red]\n"
        "[yellow]Speak your query. Results are unfiltered.[/yellow]\n"
        "[dim]Press Ctrl+C to exit[/dim]",
        border_style="red",
    ))

    asyncio.run(pipeline.run_interactive())


@cli.command()
@click.argument("query_text")
@click.option("--no-speak", is_flag=True, help="Skip TTS audio output")
@click.pass_context
def query(ctx, query_text, no_speak):
    """Search with a text query directly"""
    pipeline = ctx.obj["pipeline"]

    console.print(f"[bold cyan]Query:[/bold cyan] {query_text}")
    answer = asyncio.run(pipeline.run_query(query_text, speak=not no_speak))

    table = Table(title="Sources", show_lines=True)
    table.add_column("Engine", style="cyan")
    table.add_column("Title", style="white")
    table.add_column("URL", style="blue")
    for src in answer.sources[:10]:
        table.add_row(src.get("engine", ""), src.get("title", ""), src.get("url", ""))

    console.print(Panel(answer.answer, title="Answer", border_style="green"))
    console.print(table)
    console.print(f"[dim]Confidence: {answer.confidence:.2%}[/dim]")


@cli.command()
@click.argument("audio_file", type=click.Path(exists=True))
@click.option("--no-speak", is_flag=True, help="Skip TTS audio output")
@click.pass_context
def file(ctx, audio_file, no_speak):
    """Transcribe an audio file and search the content"""
    pipeline = ctx.obj["pipeline"]
    asyncio.run(pipeline.run_once(audio_file=audio_file))


@cli.command()
@click.argument("query_text")
@click.option("--deep/--no-deep", default=True, help="Enable deep crawling")
@click.option("--engine", "-e", multiple=True, help="Search engines to use")
@click.pass_context
def search(ctx, query_text, deep, engine):
    """Deep search only (no ASR/TTS)"""
    from src.search.engine import UncensoredSearchEngine

    config = load_config().get("search", {})
    if engine:
        config["engines"] = list(engine)

    search_engine = UncensoredSearchEngine(config)

    async def _run():
        try:
            results = await search_engine.search(query_text, deep=deep)

            table = Table(title=f"Search Results: {query_text}", show_lines=True)
            table.add_column("#", style="dim", width=4)
            table.add_column("Engine", style="cyan")
            table.add_column("Title", style="white")
            table.add_column("URL", style="blue")
            table.add_column("Snippet", style="yellow", max_width=50)
            table.add_column("Content", style="green", max_width=30)

            for i, r in enumerate(results):
                has_content = "Yes" if hasattr(r, "full_content") and r.full_content else "No"
                table.add_row(
                    str(i + 1),
                    r.source_engine,
                    r.title[:60],
                    r.url[:80],
                    r.snippet[:100],
                    has_content,
                )

            console.print(table)
            return results
        finally:
            await search_engine.close()

    results = asyncio.run(_run())

    if results and deep:
        console.print("\n[bold]Full extracted content (top result):[/bold]")
        top = results[0]
        if hasattr(top, "full_content") and top.full_content:
            console.print(Panel(top.full_content[:3000], title=top.title, border_style="green"))


if __name__ == "__main__":
    cli()
