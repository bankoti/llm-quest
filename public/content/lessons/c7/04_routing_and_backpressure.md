# 04 - Routing, Queues, and Backpressure

Routing decides which work enters which resource pool. Inputs include task,
quality requirement, deadline, token estimates, cache state, tenant policy,
model health, cost ceiling, and experiment assignment. Keep route policy
versioned and observable.

## Bound every queue

![Observability three types](content/images/c7/observability_triangle.svg)


Unbounded queues turn overload into extreme latency and memory exhaustion. For
each worker pool define maximum depth or token budget, admission priority,
estimated wait, deadline-aware rejection, and overload response. Reject early
with a baseline or explicit 429/503 rather than time out after expensive work.

Little’s Law relates stable averages:

```text
concurrency = arrival_rate * average_time_in_system
```

It is a planning check, not a tail-latency model. Bursts, heavy-tailed token
lengths, and saturation require load tests.

## Separate workload classes

Interactive queries, long document jobs, offline labels, and administration
should not share one FIFO queue. Use per-tenant fairness and reserve capacity for
short/degraded paths. A batch labeling spike must not starve user requests.

## Retry and dead-letter boundaries

Background enrichment jobs carry idempotency key, attempt count, version, and
deadline. Retry only transient errors with bounded exponential backoff and jitter.
Permanent schema or policy failures go to quarantine/dead-letter review, not an
infinite loop.

Complete the challenge below. It compares estimated wait plus work
and response reserve against remaining deadline, while enforcing queue capacity.

**Checkpoint:** Simulate a burst of long prompts. Show which requests are served,
degraded, queued, or rejected and why no queue grows without bound.
