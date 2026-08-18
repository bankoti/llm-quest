from dataclasses import dataclass
from typing import List

@dataclass
class Option:
    name: str                  # "live-model", "head-cache", "teacher-student", ...
    quality: float             # weighted quality score 0..1 (higher is better)
    p95_ms: float              # measured 95th-percentile latency
    data_leaves_region: bool   # True if user data would leave the allowed region
    has_rollback: bool         # True if a rollback / version-pinning path exists

def gate_failures(option: Option, *, deadline_ms: float) -> List[str]:
    """Name every hard gate this option violates. Check in this order:

        "privacy"  — data_leaves_region is True
        "latency"  — p95_ms > deadline_ms
        "rollback" — has_rollback is False

    Return the violated gate names in that order; empty list means the
    option passes all gates. This list is the reviewable evidence: an
    architecture review wants to see WHICH gate killed an option, not
    just that it disappeared.
    """
    raise NotImplementedError

def choose_option(options: List[Option], *, deadline_ms: float) -> str:
    """The lesson's decision method, in code.

    1. Eliminate every option with at least one gate failure.
       A weighted quality score must NEVER compensate for a hard
       violation — that is the gotcha this challenge grades.
    2. Among survivors, return the name of the highest-quality option.
    3. If nothing survives, return "no-viable-option". That answer is
       real: it means the constraints must change, not the scoring.
    """
    raise NotImplementedError
