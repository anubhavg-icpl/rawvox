"""
Content extractor and synthesizer.
Takes deep search results, ranks relevance, and produces a synthesized answer.
Uses sentence-transformers for semantic ranking. No content filtering.
"""

import re
from dataclasses import dataclass

from sentence_transformers import SentenceTransformer, util


@dataclass
class SynthesizedAnswer:
    answer: str
    sources: list[dict]
    confidence: float
    raw_chunks: list[str]


class ContentExtractor:
    def __init__(self, config: dict = None):
        self.config = config or {}
        self._model = None

    def _load_model(self):
        if self._model is None:
            print("[Extractor] Loading sentence-transformer model...")
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            print("[Extractor] Model loaded")

    def _chunk_text(self, text: str, chunk_size: int = 512) -> list[str]:
        if not text:
            return []
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""
        for sentence in sentences:
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += " " + sentence
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        return chunks

    def _rank_chunks(self, query: str, chunks: list[str], top_k: int = 15) -> list[tuple[str, float]]:
        if not chunks:
            return []
        self._load_model()
        query_emb = self._model.encode(query, convert_to_tensor=True)
        chunk_embs = self._model.encode(chunks, convert_to_tensor=True)
        scores = util.cos_sim(query_emb, chunk_embs)[0]
        ranked = sorted(
            zip(chunks, scores.tolist()),
            key=lambda x: x[1],
            reverse=True,
        )
        return ranked[:top_k]

    def _extract_key_facts(self, ranked_chunks: list[tuple[str, float]]) -> list[str]:
        facts = []
        for chunk, score in ranked_chunks:
            if score > 0.15:
                facts.append(chunk.strip())
        return facts

    def synthesize(
        self,
        query: str,
        search_results: list,
    ) -> SynthesizedAnswer:
        print(f"[Extractor] Synthesizing answer for: '{query}'")

        all_chunks = []
        sources = []

        for result in search_results:
            content = getattr(result, "full_content", "") or ""
            snippet = getattr(result, "snippet", "")
            url = getattr(result, "url", "")
            title = getattr(result, "title", "")
            engine = getattr(result, "source_engine", "")

            combined = f"{snippet}\n{content}" if content else snippet
            chunks = self._chunk_text(combined)

            for chunk in chunks:
                all_chunks.append((chunk, url, title))

            if url:
                sources.append({"title": title, "url": url, "engine": engine})

        if not all_chunks:
            return SynthesizedAnswer(
                answer="No relevant content found for your query.",
                sources=[],
                confidence=0.0,
                raw_chunks=[],
            )

        texts = [c[0] for c in all_chunks]
        ranked = self._rank_chunks(query, texts, top_k=15)
        facts = self._extract_key_facts(ranked)

        # Build synthesized answer from top facts
        answer_parts = []
        for i, fact in enumerate(facts[:10]):
            answer_parts.append(fact)

        answer = "\n\n".join(answer_parts)
        avg_confidence = sum(s for _, s in ranked[:10]) / max(len(ranked[:10]), 1)

        print(f"[Extractor] Synthesized {len(facts)} key facts (confidence: {avg_confidence:.2f})")

        return SynthesizedAnswer(
            answer=answer,
            sources=sources[:10],
            confidence=avg_confidence,
            raw_chunks=[c[0] for c in ranked[:10]],
        )
