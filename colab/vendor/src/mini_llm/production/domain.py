"""Typed contracts shared by the production specialization."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass(frozen=True)
class Product:
    product_id: str
    title: str
    description: str
    vertical: str
    category: str
    attributes: Tuple[str, ...] = ()
    locale: str = "en-US"
    in_stock: bool = True

    @property
    def searchable_text(self) -> str:
        return " ".join(
            (
                self.title,
                self.description,
                self.vertical,
                self.category,
                *self.attributes,
            )
        )


@dataclass(frozen=True)
class QueryCase:
    query: str
    relevant_ids: Tuple[str, ...]
    frequency: str
    intent: str
    required_attributes: Tuple[str, ...] = ()
    locale: str = "en-US"


@dataclass(frozen=True)
class SearchResult:
    product_id: str
    title: str
    score: float
    sources: Tuple[str, ...]


@dataclass(frozen=True)
class SearchResponse:
    query: str
    normalized_query: str
    route: str
    results: Tuple[SearchResult, ...]
    fallback_reason: Optional[str] = None
    versions: Dict[str, str] = field(default_factory=dict)
    trace: Tuple[str, ...] = ()


Ranking = Dict[str, List[str]]
