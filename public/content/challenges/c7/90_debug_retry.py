"""Debug — Retry Storm 🐛
An AI assistant wrote the retry helper. In the last outage, retries multiplied
load instead of shedding it and took the service fully down. ONE bug.
"""
from typing import List

def retry_delays_ms(attempts: int, base_ms: int = 100, cap_ms: int = 2000) -> List[int]:
    """Delay before each retry: exponential backoff starting at base_ms,
    doubling each attempt, capped at cap_ms."""
    return [min(base_ms * a, cap_ms) for a in range(1, attempts + 1)]
