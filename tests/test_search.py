"""Quick test for the search module (no GPU/audio needed)."""
import asyncio
from src.search.engine import UncensoredSearchEngine


async def test():
    config = {
        "engines": ["duckduckgo"],
        "max_results": 5,
        "max_depth": 2,
        "timeout": 15,
    }
    engine = UncensoredSearchEngine(config)
    try:
        results = await engine.search("open source speech recognition models", deep=True)
        print(f"\nFound {len(results)} results:")
        for r in results:
            print(f"  [{r.source_engine}] {r.title}")
            print(f"    {r.url}")
            if hasattr(r, "full_content") and r.full_content:
                print(f"    Content: {r.full_content[:200]}...")
            print()
    finally:
        await engine.close()


if __name__ == "__main__":
    asyncio.run(test())
