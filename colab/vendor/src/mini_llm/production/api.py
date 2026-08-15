"""Transport-neutral API boundary with auth, quotas, and structured errors."""

import secrets
from collections import Counter
from dataclasses import asdict, dataclass
from typing import Any, Dict, Mapping, MutableMapping, Optional

from .service import SearchService


@dataclass(frozen=True)
class ApiResponse:
    status: int
    body: Dict[str, Any]


class InMemoryRateLimiter:
    """Deterministic teaching limiter; production uses a shared atomic store."""

    def __init__(self, requests_per_subject: int = 10) -> None:
        self.limit = requests_per_subject
        self.counts: MutableMapping[str, int] = Counter()

    def allow(self, subject: str) -> bool:
        self.counts[subject] += 1
        return self.counts[subject] <= self.limit


class SearchAPI:
    def __init__(
        self,
        service: SearchService,
        api_key: str,
        limiter: Optional[InMemoryRateLimiter] = None,
    ) -> None:
        if not api_key:
            raise ValueError("api_key must not be empty")
        self.service = service
        self.api_key = api_key
        self.limiter = limiter or InMemoryRateLimiter()

    @staticmethod
    def error(status: int, code: str, message: str) -> ApiResponse:
        return ApiResponse(status, {"error": {"code": code, "message": message}})

    def handle(
        self, headers: Mapping[str, str], payload: Mapping[str, Any]
    ) -> ApiResponse:
        supplied_key = headers.get("authorization", "").removeprefix("Bearer ")
        if not secrets.compare_digest(supplied_key, self.api_key):
            return self.error(401, "unauthorized", "valid bearer credentials required")
        subject = headers.get("x-subject-id", "anonymous")
        if not self.limiter.allow(subject):
            return self.error(429, "rate_limited", "request quota exceeded")
        query = payload.get("query")
        limit = payload.get("limit", 5)
        if not isinstance(query, str) or not query.strip():
            return self.error(400, "invalid_query", "query must be a non-empty string")
        if not isinstance(limit, int) or not 1 <= limit <= 20:
            return self.error(400, "invalid_limit", "limit must be between 1 and 20")
        try:
            response = self.service.search(query, limit)
        # The transport boundary must not expose dependency or implementation details.
        except Exception:  # noqa: BLE001
            self.service.telemetry.increment("api.internal_error")
            return self.error(500, "internal_error", "search could not be completed")
        return ApiResponse(200, asdict(response))
