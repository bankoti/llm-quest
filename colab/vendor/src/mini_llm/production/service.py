"""Framework-neutral request orchestration with telemetry and fallbacks."""

from collections import Counter
from dataclasses import dataclass, field
from typing import Dict, Optional, Sequence

from .domain import Product, SearchResponse
from .retrieval import HybridRetriever, LexicalRetriever, QueryInterpreter


@dataclass
class Telemetry:
    counters: Counter = field(default_factory=Counter)

    def increment(self, name: str) -> None:
        self.counters[name] += 1


class SearchService:
    def __init__(
        self,
        products: Sequence[Product],
        interpreter: Optional[QueryInterpreter] = None,
        live_rewriter: Optional[object] = None,
    ) -> None:
        self.interpreter = interpreter or QueryInterpreter()
        self.live_rewriter = live_rewriter
        self.lexical = LexicalRetriever(products)
        self.hybrid = HybridRetriever(products)
        self.telemetry = Telemetry()
        self.versions: Dict[str, str] = {
            "schema": "1",
            "catalog": "demo-1",
            "interpreter": "rules-1",
            "index": "hybrid-1",
        }

    def search(self, query: str, limit: int = 5) -> SearchResponse:
        if not query.strip():
            raise ValueError("query must not be empty")
        trace = ["validated"]
        fallback_reason = None
        try:
            interpreted = self.interpreter.interpret(query, self.live_rewriter)
            trace.append(f"interpreted:{interpreted.source}")
            results = self.hybrid.search(interpreted, limit)
            route = interpreted.source
            if not results:
                raise LookupError("hybrid retrieval returned no candidates")
        except (LookupError, TimeoutError, ValueError) as error:
            self.telemetry.increment("fallback")
            fallback_reason = type(error).__name__
            interpreted = self.interpreter.interpret(query, None)
            results = self.lexical.search(query, limit)
            route = "lexical-fallback"
            trace.append(f"fallback:{fallback_reason}")
        self.telemetry.increment(f"route.{route}")
        return SearchResponse(
            query=query,
            normalized_query=interpreted.normalized,
            route=route,
            results=tuple(results),
            fallback_reason=fallback_reason,
            versions=dict(self.versions),
            trace=tuple(trace),
        )
