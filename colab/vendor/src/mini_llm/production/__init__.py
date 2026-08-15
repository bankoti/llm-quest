"""A laptop-sized production search system used by Courses 4-8."""

from .data import demo_catalog, demo_queries
from .domain import Product, QueryCase, SearchResponse, SearchResult
from .evaluation import EvaluationReport, evaluate_rankings
from .grounding import GroundedExplanation, explain_product, validate_citations
from .retrieval import HybridRetriever, LexicalRetriever, QueryInterpreter
from .service import SearchService

__all__ = [
    "EvaluationReport",
    "HybridRetriever",
    "GroundedExplanation",
    "LexicalRetriever",
    "Product",
    "QueryCase",
    "QueryInterpreter",
    "SearchResponse",
    "SearchResult",
    "SearchService",
    "demo_catalog",
    "demo_queries",
    "evaluate_rankings",
    "explain_product",
    "validate_citations",
]
