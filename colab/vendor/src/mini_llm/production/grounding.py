"""Catalog-grounded explanations with machine-checkable citations."""

from dataclasses import dataclass
from typing import Mapping, Tuple

from .domain import Product


@dataclass(frozen=True)
class GroundedExplanation:
    text: str
    citations: Tuple[str, ...]


def explain_product(query: str, product: Product) -> GroundedExplanation:
    attributes = (
        ", ".join(product.attributes) if product.attributes else "no extra attributes"
    )
    text = (
        f"{product.title} matches {query!r} in category {product.category}; "
        f"catalog attributes: {attributes}."
    )
    return GroundedExplanation(text, ("title", "category", "attributes"))


def validate_citations(
    explanation: GroundedExplanation, catalog_fields: Mapping[str, object]
) -> bool:
    allowed = {
        "title",
        "description",
        "vertical",
        "category",
        "attributes",
        "locale",
        "in_stock",
    }
    return bool(explanation.citations) and all(
        citation in allowed and citation in catalog_fields
        for citation in explanation.citations
    )
