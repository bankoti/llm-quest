# 06 - Timeouts, Retries, Circuit Breakers, and Fallbacks

Resilience preserves a useful contract under partial failure. It does not mean
repeating every failed call.

## Timeout hierarchy

Set connect, first-byte, idle/stream, and total deadlines below the caller’s
remaining time. Reserve fallback and serialization time. Cancel downstream work
on expiry. A timeout should identify the dependency and route without exposing
provider internals to the client.

## Retry policy

Retry only transient, idempotent operations when enough deadline remains. Use
bounded attempts, exponential backoff with jitter, and a retry budget limiting
extra load.

> **Gotcha:** do not retry invalid schema, authorization, policy rejection, or
> deterministic context-limit errors. Retry storms amplify outages.

## Circuit breaker

![Circuit breaker state machine](content/images/c7/circuit_breaker.svg)


A breaker tracks recent failures. In **closed** state calls flow. After a threshold
it becomes **open** and fails fast to fallback. After a cooldown, **half-open**
permits limited probes; success closes it, failure reopens it. Partition breakers
by dependency/model/region so one fault does not disable everything.

Complete the challenge below. The teaching state machine uses counts;
production needs windows, concurrency safety, clocks, metrics, and distributed
coordination where appropriate.

## Fallback ladder

```text
enhanced route -> cached validated output -> deterministic rules/lexical
               -> clarification/no-result with stable schema
```

Fallbacks must apply current authorization and policy, identify stale artifacts,
and avoid a second failing dependency. Test quality, not only status code.

## Failure injection

Inject timeout, malformed output, connection reset, slow stream, empty index,
stale cache, quota, and cancellation. Verify bounded latency, no side-effect
duplication, correct telemetry, and recovery after dependency health returns.

**Checkpoint:** For each dependency, classify errors as retry, fallback, reject,
or incident. State the evidence and deadline needed for the choice.
