"""Deterministic experiment assignment and simple effect reporting."""

import hashlib
from dataclasses import dataclass
from typing import Iterable


def assign_variant(subject_id: str, experiment: str = "search-v1") -> str:
    digest = hashlib.sha256(f"{experiment}:{subject_id}".encode("utf-8")).digest()
    return "treatment" if digest[0] % 2 else "control"


@dataclass(frozen=True)
class ExperimentEvent:
    subject_id: str
    variant: str
    converted: bool


def conversion_lift(events: Iterable[ExperimentEvent]) -> float:
    rows = list(events)
    rates = {}
    for variant in ("control", "treatment"):
        group = [event for event in rows if event.variant == variant]
        if not group:
            raise ValueError(f"missing {variant} observations")
        rates[variant] = sum(event.converted for event in group) / len(group)
    return rates["treatment"] - rates["control"]
