"""Offline ranking metrics with frequency-slice reporting."""

import math
from dataclasses import dataclass
from typing import Dict, Mapping, Sequence

from .domain import QueryCase


def recall_at_k(
    ranked_ids: Sequence[str], relevant_ids: Sequence[str], k: int
) -> float:
    relevant = set(relevant_ids)
    if not relevant:
        return 1.0
    return len(relevant.intersection(ranked_ids[:k])) / len(relevant)


def ndcg_at_k(ranked_ids: Sequence[str], relevant_ids: Sequence[str], k: int) -> float:
    relevant = set(relevant_ids)
    gains = [1.0 if product_id in relevant else 0.0 for product_id in ranked_ids[:k]]
    actual = sum(gain / math.log2(rank + 2) for rank, gain in enumerate(gains))
    ideal = sum(1.0 / math.log2(rank + 2) for rank in range(min(k, len(relevant))))
    return actual / ideal if ideal else 1.0


@dataclass(frozen=True)
class EvaluationReport:
    recall_at_k: float
    ndcg_at_k: float
    zero_result_rate: float
    slices: Dict[str, Dict[str, float]]


def evaluate_rankings(
    cases: Sequence[QueryCase],
    rankings: Mapping[str, Sequence[str]],
    k: int = 5,
) -> EvaluationReport:
    rows = []
    for case in cases:
        ranked = list(rankings.get(case.query, ()))
        rows.append(
            (
                case.frequency,
                recall_at_k(ranked, case.relevant_ids, k),
                ndcg_at_k(ranked, case.relevant_ids, k),
                not ranked,
            )
        )

    def aggregate(values: Sequence[tuple]) -> Dict[str, float]:
        count = len(values) or 1
        return {
            "recall_at_k": sum(row[1] for row in values) / count,
            "ndcg_at_k": sum(row[2] for row in values) / count,
            "zero_result_rate": sum(row[3] for row in values) / count,
        }

    overall = aggregate(rows)
    frequencies = sorted({row[0] for row in rows})
    slices = {
        frequency: aggregate([row for row in rows if row[0] == frequency])
        for frequency in frequencies
    }
    return EvaluationReport(
        overall["recall_at_k"],
        overall["ndcg_at_k"],
        overall["zero_result_rate"],
        slices,
    )
