"""Readable lexical, semantic, fusion, and constrained query-understanding code."""

import hashlib
import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

from .domain import Product, SearchResult

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> List[str]:
    return TOKEN_PATTERN.findall(text.lower())


@dataclass(frozen=True)
class InterpretedQuery:
    original: str
    normalized: str
    intent: Optional[str]
    required_attributes: Tuple[str, ...]
    source: str


class QueryInterpreter:
    """Constrain normalization to an explicit, inspectable commerce vocabulary."""

    def __init__(self, cached_rewrites: Optional[Mapping[str, str]] = None) -> None:
        self.cached_rewrites = dict(
            cached_rewrites or {"protein": "protein supplements"}
        )
        self.attribute_phrases = {
            "vegan": "vegan",
            "dairy free": "dairy-free",
            "gluten free": "gluten-free",
            "one percent": "1-percent",
            "older iphone": "lightning",
            "spicy": "spicy",
        }
        self.intent_phrases = {
            "protein supplement": "protein supplements",
            "phone charger": "phone accessories",
            "prepared meal": "prepared meals",
            "sandwich": "sandwiches",
            "noodle": "noodles",
            "snack": "snacks",
            "milk": "milk",
        }

    def interpret(
        self, query: str, live_rewriter: Optional[object] = None
    ) -> InterpretedQuery:
        clean = " ".join(tokenize(query))
        source = "identity"
        normalized = clean
        if clean in self.cached_rewrites:
            normalized = self.cached_rewrites[clean]
            source = "head-cache"
        elif live_rewriter is not None:
            candidate = live_rewriter.rewrite(clean)
            if not isinstance(candidate, str) or not candidate.strip():
                raise ValueError("live rewriter returned an invalid query")
            normalized = " ".join(tokenize(candidate))
            source = "tail-model"

        attributes = tuple(
            canonical
            for phrase, canonical in self.attribute_phrases.items()
            if phrase in clean
        )
        combined = f"{clean} {normalized}"
        intent = next(
            (
                canonical
                for phrase, canonical in self.intent_phrases.items()
                if all(part in combined for part in phrase.split())
            ),
            None,
        )
        return InterpretedQuery(query, normalized, intent, attributes, source)


class LexicalRetriever:
    """A compact BM25-style baseline with no external search dependency."""

    def __init__(self, products: Sequence[Product]) -> None:
        self.products = list(products)
        self.documents = [
            Counter(tokenize(product.searchable_text)) for product in products
        ]
        self.lengths = [sum(document.values()) for document in self.documents]
        self.average_length = sum(self.lengths) / max(1, len(self.lengths))
        self.document_frequency = Counter(
            token for document in self.documents for token in document
        )

    def _score(self, query_tokens: Iterable[str], index: int) -> float:
        score = 0.0
        document = self.documents[index]
        length = self.lengths[index]
        for token in query_tokens:
            frequency = document[token]
            if frequency == 0:
                continue
            document_frequency = self.document_frequency[token]
            inverse_frequency = math.log(
                1
                + (len(self.documents) - document_frequency + 0.5)
                / (document_frequency + 0.5)
            )
            denominator = frequency + 1.2 * (0.25 + 0.75 * length / self.average_length)
            score += inverse_frequency * frequency * 2.2 / denominator
        return score

    def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        scored = [
            (self._score(tokenize(query), index), product)
            for index, product in enumerate(self.products)
            if product.in_stock
        ]
        scored.sort(key=lambda pair: (-pair[0], pair[1].product_id))
        return [
            SearchResult(product.product_id, product.title, score, ("lexical",))
            for score, product in scored[:limit]
            if score > 0
        ]


class HashingSemanticRetriever:
    """A deterministic character-ngram embedding baseline for local experiments."""

    def __init__(self, products: Sequence[Product], dimensions: int = 256) -> None:
        self.products = list(products)
        self.dimensions = dimensions
        self.vectors = [self.embed(product.searchable_text) for product in products]

    def embed(self, text: str) -> List[float]:
        normalized = f"  {' '.join(tokenize(text))}  "
        vector = [0.0] * self.dimensions
        for index in range(max(0, len(normalized) - 2)):
            ngram = normalized[index : index + 3]
            digest = hashlib.blake2b(ngram.encode("utf-8"), digest_size=8).digest()
            bucket = int.from_bytes(digest, "big") % self.dimensions
            vector[bucket] += 1.0
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    def search(self, query: str, limit: int = 10) -> List[SearchResult]:
        query_vector = self.embed(query)
        scored = [
            (sum(left * right for left, right in zip(query_vector, vector)), product)
            for vector, product in zip(self.vectors, self.products)
            if product.in_stock
        ]
        scored.sort(key=lambda pair: (-pair[0], pair[1].product_id))
        return [
            SearchResult(product.product_id, product.title, score, ("semantic",))
            for score, product in scored[:limit]
            if score > 0
        ]


def reciprocal_rank_fusion(
    rankings: Sequence[Sequence[SearchResult]], k: int = 60
) -> Dict[str, float]:
    fused: Dict[str, float] = {}
    for ranking in rankings:
        for rank, result in enumerate(ranking, start=1):
            fused[result.product_id] = fused.get(result.product_id, 0.0) + 1.0 / (
                k + rank
            )
    return fused


class HybridRetriever:
    def __init__(self, products: Sequence[Product]) -> None:
        self.products = {product.product_id: product for product in products}
        values = list(products)
        self.lexical = LexicalRetriever(values)
        self.semantic = HashingSemanticRetriever(values)

    def search(
        self,
        interpreted: InterpretedQuery,
        limit: int = 10,
    ) -> List[SearchResult]:
        query = interpreted.normalized
        lexical = self.lexical.search(query, limit=max(limit, 20))
        semantic = self.semantic.search(query, limit=max(limit, 20))
        fused = reciprocal_rank_fusion((lexical, semantic))
        allowed = []
        for product_id, score in fused.items():
            product = self.products[product_id]
            if interpreted.required_attributes and not set(
                interpreted.required_attributes
            ).issubset(product.attributes):
                continue
            if interpreted.intent and interpreted.intent != product.category:
                continue
            sources = tuple(
                name
                for name, ranking in (("lexical", lexical), ("semantic", semantic))
                if any(result.product_id == product_id for result in ranking)
            )
            allowed.append(SearchResult(product_id, product.title, score, sources))
        allowed.sort(key=lambda result: (-result.score, result.product_id))
        return allowed[:limit]
