"""
Uncensored deep web search module.
Aggregates results from multiple search engines with no content filtering.
Supports SearXNG (self-hosted), DuckDuckGo, Brave, Mojeek, Qwant.
Crawls results deeply for comprehensive answers.
"""

import asyncio
import re
import time
from dataclasses import dataclass, field
from urllib.parse import quote_plus, unquote, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    source_engine: str
    rank: int


@dataclass
class DeepResult:
    title: str
    url: str
    snippet: str
    full_content: str
    source_engine: str
    depth: int


class UncensoredSearchEngine:
    def __init__(self, config: dict):
        self.config = config
        self.engines = config.get("engines", ["duckduckgo", "brave", "mojeek"])
        self.max_results = config.get("max_results", 20)
        self.timeout = config.get("timeout", 30)
        self.max_depth = config.get("max_depth", 3)
        self.max_content_length = config.get("max_content_length", 50000)
        self.searxng_url = config.get("searxng_url", "")
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                follow_redirects=self.config.get("follow_redirects", True),
                verify=self.config.get("verify_ssl", False),
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                },
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # --- SearXNG (self-hosted, no censorship) ---
    async def _search_searxng(self, query: str) -> list[SearchResult]:
        if not self.searxng_url:
            return []
        try:
            client = await self._get_client()
            resp = await client.get(
                f"{self.searxng_url}/search",
                params={
                    "q": query,
                    "format": "json",
                    "engines": ",".join(self.engines),
                    "safesearch": 0,  # 0 = OFF (uncensored)
                },
            )
            data = resp.json()
            results = []
            for i, item in enumerate(data.get("results", [])[: self.max_results]):
                results.append(
                    SearchResult(
                        title=item.get("title", ""),
                        url=item.get("url", ""),
                        snippet=item.get("content", ""),
                        source_engine="searxng",
                        rank=i,
                    )
                )
            return results
        except Exception as e:
            print(f"[Search] SearXNG error: {e}")
            return []

    # --- DuckDuckGo HTML (no API key, uncensored) ---
    async def _search_duckduckgo(self, query: str) -> list[SearchResult]:
        try:
            client = await self._get_client()
            resp = await client.get(
                "https://html.duckduckgo.com/html/",
                params={"q": query},
            )
            return self._parse_ddg_html(resp.text)
        except Exception as e:
            print(f"[Search] DuckDuckGo error: {e}")
            return []

    def _parse_ddg_html(self, html: str) -> list[SearchResult]:
        soup = BeautifulSoup(html, "lxml")
        results = []
        for i, item in enumerate(soup.select(".result")):
            title_el = item.select_one(".result__a")
            snippet_el = item.select_one(".result__snippet")
            if not title_el:
                continue
            href = title_el.get("href", "")
            # DDG puts actual URL in the uddg param, URL-encoded
            url_match = re.search(r"uddg=([^&]+)", href)
            if url_match:
                actual_url = unquote(url_match.group(1))
            else:
                actual_url = href
            # Skip DDG internal/ad redirect URLs
            if "duckduckgo.com/y.js" in actual_url or "duckduckgo.com/?q=" in actual_url:
                continue
            results.append(
                SearchResult(
                    title=title_el.get_text(strip=True),
                    url=actual_url,
                    snippet=snippet_el.get_text(strip=True) if snippet_el else "",
                    source_engine="duckduckgo",
                    rank=i,
                )
            )
        return results[: self.max_results]

    # --- Brave Search ---
    async def _search_brave(self, query: str) -> list[SearchResult]:
        try:
            client = await self._get_client()
            resp = await client.get(
                "https://search.brave.com/search",
                params={"q": query, "safesearch": "off"},
            )
            return self._parse_brave_html(resp.text)
        except Exception as e:
            print(f"[Search] Brave error: {e}")
            return []

    def _parse_brave_html(self, html: str) -> list[SearchResult]:
        soup = BeautifulSoup(html, "lxml")
        results = []
        for i, item in enumerate(soup.select(".snippet[data-type='web']")):
            title_el = item.select_one(".title")
            snippet_el = item.select_one(".snippet-description")
            url_el = item.select_one(".url")
            if title_el:
                results.append(
                    SearchResult(
                        title=title_el.get_text(strip=True),
                        url=url_el.get_text(strip=True) if url_el else "",
                        snippet=snippet_el.get_text(strip=True) if snippet_el else "",
                        source_engine="brave",
                        rank=i,
                    )
                )
        return results[: self.max_results]

    # --- Mojeek (privacy-focused, no censorship) ---
    async def _search_mojeek(self, query: str) -> list[SearchResult]:
        try:
            client = await self._get_client()
            resp = await client.get(
                "https://www.mojeek.com/search",
                params={"q": query, "fmt": "html"},
            )
            return self._parse_mojeek_html(resp.text)
        except Exception as e:
            print(f"[Search] Mojeek error: {e}")
            return []

    def _parse_mojeek_html(self, html: str) -> list[SearchResult]:
        soup = BeautifulSoup(html, "lxml")
        results = []
        for i, item in enumerate(soup.select(".results-standard li")):
            title_el = item.select_one(".title a")
            snippet_el = item.select_one(".s")
            url_el = item.select_one(".url")
            if title_el:
                results.append(
                    SearchResult(
                        title=title_el.get_text(strip=True),
                        url=title_el.get("href", ""),
                        snippet=snippet_el.get_text(strip=True) if snippet_el else "",
                        source_engine="mojeek",
                        rank=i,
                    )
                )
        return results[: self.max_results]

    # --- Deep crawl: fetch full content from result URLs ---
    async def _crawl_page(self, url: str, depth: int = 0) -> str:
        try:
            client = await self._get_client()
            resp = await client.get(url)
            content = self._extract_text(resp.text)
            return content[: self.max_content_length]
        except Exception as e:
            print(f"[Search] Crawl error for {url}: {e}")
            return ""

    def _extract_text(self, html: str) -> str:
        soup = BeautifulSoup(html, "lxml")
        # Remove scripts, styles, nav, footer
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()
        # Try article/main first
        main = soup.find("article") or soup.find("main") or soup.find("body")
        if main:
            return main.get_text(separator="\n", strip=True)
        return soup.get_text(separator="\n", strip=True)

    # --- Aggregate search across all engines ---
    async def search(self, query: str, deep: bool = True) -> list[SearchResult | DeepResult]:
        print(f"[Search] Querying: '{query}'")
        tasks = []

        if self.searxng_url:
            tasks.append(self._search_searxng(query))
        if "duckduckgo" in self.engines:
            tasks.append(self._search_duckduckgo(query))
        if "brave" in self.engines:
            tasks.append(self._search_brave(query))
        if "mojeek" in self.engines:
            tasks.append(self._search_mojeek(query))

        all_results_lists = await asyncio.gather(*tasks, return_exceptions=True)

        # Deduplicate by URL
        seen_urls = set()
        aggregated: list[SearchResult] = []
        for result_list in all_results_lists:
            if isinstance(result_list, Exception):
                continue
            for result in result_list:
                normalized = result.url.rstrip("/")
                if normalized not in seen_urls:
                    seen_urls.add(normalized)
                    aggregated.append(result)

        aggregated.sort(key=lambda r: r.rank)
        aggregated = aggregated[: self.max_results]

        print(f"[Search] Found {len(aggregated)} unique results")

        # Deep crawl
        if deep and aggregated:
            print(f"[Search] Deep crawling top {min(len(aggregated), self.max_depth)} results...")
            crawl_tasks = [
                self._crawl_page(r.url, depth=0)
                for r in aggregated[: self.max_depth]
            ]
            contents = await asyncio.gather(*crawl_tasks, return_exceptions=True)

            deep_results: list[DeepResult] = []
            for result, content in zip(aggregated[: self.max_depth], contents):
                content_text = content if isinstance(content, str) else ""
                deep_results.append(
                    DeepResult(
                        title=result.title,
                        url=result.url,
                        snippet=result.snippet,
                        full_content=content_text,
                        source_engine=result.source_engine,
                        depth=0,
                    )
                )

            # Add remaining non-crawled results
            for result in aggregated[self.max_depth :]:
                deep_results.append(
                    DeepResult(
                        title=result.title,
                        url=result.url,
                        snippet=result.snippet,
                        full_content="",
                        source_engine=result.source_engine,
                        depth=-1,
                    )
                )

            return deep_results

        return aggregated


# --- Synchronous wrapper ---
def search_sync(query: str, config: dict = None, deep: bool = True) -> list:
    if config is None:
        config = {"engines": ["duckduckgo", "brave"], "max_results": 20, "max_depth": 3, "timeout": 30}

    engine = UncensoredSearchEngine(config)

    async def _run():
        try:
            results = await engine.search(query, deep=deep)
            return results
        finally:
            await engine.close()

    return asyncio.run(_run())
