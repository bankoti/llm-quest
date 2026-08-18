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

## Circuit breaker (preview)

A breaker tracks recent failures per dependency and fails fast to fallback when
a dependency is clearly down, instead of paying the timeout on every call. You
will build the full closed/open/half-open state machine in the Circuit Breaker
level; here, what matters is that the fallback ladder below is where an open
breaker sends traffic.

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
