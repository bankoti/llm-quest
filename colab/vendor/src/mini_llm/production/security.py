"""Small security boundaries for untrusted catalog and query text."""

import re
from dataclasses import dataclass
from typing import Tuple

INJECTION_PATTERNS = (
    re.compile(r"ignore (all |the )?(previous|prior) instructions", re.I),
    re.compile(r"system prompt", re.I),
    re.compile(r"reveal (the )?(secret|token|api key)", re.I),
)


@dataclass(frozen=True)
class SecurityDecision:
    allowed: bool
    reasons: Tuple[str, ...]


def inspect_untrusted_text(text: str, maximum_length: int = 2_000) -> SecurityDecision:
    reasons = []
    if len(text) > maximum_length:
        reasons.append("too_long")
    if any(pattern.search(text) for pattern in INJECTION_PATTERNS):
        reasons.append("prompt_injection_pattern")
    if "\x00" in text:
        reasons.append("null_byte")
    return SecurityDecision(not reasons, tuple(reasons))
