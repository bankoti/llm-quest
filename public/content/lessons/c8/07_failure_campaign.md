# 07 - Resilience and Failure Campaign

Create a failure matrix before injecting faults. Each row includes stage,
injection, expected response, maximum latency, security invariant, telemetry,
operator action, recovery, and evidence link.

## Mandatory injections

- live model timeout, slow stream, malformed schema, and quota error;
- vector retrieval timeout/unavailable/empty;
- stale index and incompatible taxonomy/index versions;
- cache loss and stale cache entry;
- queue saturation and retry storm;
- model/index deployment regression;
- telemetry backend failure;
- client cancellation during expensive work;
- prompt-injected catalog text and cross-tenant source;
- teacher-label or confidence-distribution drift.

Test combinations where reasonable: dependency slowdown during peak, cache cold
after rollback, and model failure while telemetry is degraded. Do not create an
unbounded combinatorial campaign; prioritize blast radius and control interaction.

Verify deadline propagation, cancellation, retry budget, circuit breaker,
idempotency, fallback quality, policy/auth, alerts, and automatic recovery.
Fallback capacity must handle expected diverted traffic.

Complete the challenge below; it checks scenario/control coverage but
cannot prove the controls work. Attach test or trace evidence for every required
row.

**Exit gate:** every mandatory scenario has observed bounded behavior; no fallback
bypasses security; recovery returns versions and metrics to baseline; failed
controls become blockers or accepted residual risks.
