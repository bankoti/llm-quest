# 04 - Derive SLOs and Budgets

An SLO turns “fast and reliable” into an engineering constraint. Define the
service-level indicator, population, threshold, percentile or window, and allowed
exclusions. For example: “99.9% of valid search requests return a useful response
within 200 ms over 28 days.” “Useful” may include a declared lexical fallback but
not an empty 200 response.

## Latency budget

![Latency budget bar](content/images/c4/latency_budget.svg)


Start from the user-facing p95 or p99 target and subtract client/network overhead,
gateway, serialization, and reserve. Allocate the remaining critical path. For
sequential stages, add budgets. For parallel branches, budget approximately the
slowest branch plus fan-out/fan-in overhead.

```text
total = fixed + max(lexical, vector) + rerank + policy + serialize + reserve
```

Percentiles are not safely additive from independent dashboards; component p95s
may occur on different requests. Use trace-level end-to-end measurements and load
tests, then use budgets as design limits.

## Reliability budget

If a live model succeeds 99.5% of the time but the service target is 99.9%, it
cannot be a required dependency. A deadline and baseline fallback can preserve
service availability while reducing enhanced-route coverage. Track both response
availability and enhancement success.

## Quality and cost budgets

Specify minimum quality by critical slice, maximum violation rates, and a
non-inferiority margin for guardrails. Convert infrastructure and model charges
to cost per thousand requests and cost per successful incremental outcome.
Average token cost is insufficient when tail prompts or retries dominate.

## Exercise

Complete `workbook/03_slo_budget.py`. Reject a design that allocates no reserve
or exceeds the critical path. Then change vector retrieval from sequential to
parallel and explain why total latency changes while per-stage budgets do not.

**Checkpoint:** Define separate SLOs for online search and offline index freshness.
One cannot compensate for the other.
