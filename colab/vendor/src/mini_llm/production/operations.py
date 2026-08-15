"""Latency, cost, and launch evidence used by the production capstone."""

from dataclasses import dataclass
from typing import Iterable, List


def percentile(values: Iterable[float], quantile: float) -> float:
    rows = sorted(values)
    if not rows:
        raise ValueError("at least one observation is required")
    if not 0.0 <= quantile <= 1.0:
        raise ValueError("quantile must be in [0, 1]")
    index = round((len(rows) - 1) * quantile)
    return rows[index]


@dataclass(frozen=True)
class LatencyReport:
    p50_ms: float
    p95_ms: float
    p99_ms: float


def latency_report(milliseconds: Iterable[float]) -> LatencyReport:
    values = list(milliseconds)
    return LatencyReport(
        percentile(values, 0.50),
        percentile(values, 0.95),
        percentile(values, 0.99),
    )


@dataclass(frozen=True)
class CostInputs:
    model_cost_per_million_tokens: float
    average_tokens_per_model_request: int
    model_route_fraction: float
    fixed_infrastructure_per_hour: float
    queries_per_hour: int


def cost_per_thousand_queries(inputs: CostInputs) -> float:
    if inputs.queries_per_hour <= 0:
        raise ValueError("queries_per_hour must be positive")
    token_cost = (
        1000
        * inputs.model_route_fraction
        * inputs.average_tokens_per_model_request
        * inputs.model_cost_per_million_tokens
        / 1_000_000
    )
    infrastructure = (
        1000 * inputs.fixed_infrastructure_per_hour / inputs.queries_per_hour
    )
    return token_cost + infrastructure


@dataclass(frozen=True)
class LaunchEvidence:
    quality_ok: bool
    latency_ok: bool
    fallback_ok: bool
    security_ok: bool
    rollback_ok: bool
    required_artifacts: List[str]

    @property
    def can_launch(self) -> bool:
        gates = (
            self.quality_ok,
            self.latency_ok,
            self.fallback_ok,
            self.security_ok,
            self.rollback_ok,
        )
        return all(gates) and len(self.required_artifacts) >= 5
