# 05 - Observability for AI Request Paths

Observability answers different questions through traces, metrics, and logs.
Use OpenTelemetry semantic conventions where they fit and extend them with
versioned domain attributes. The GenAI conventions continue to evolve, so pin
the convention and instrumentation versions.

## Traces explain one request

Create spans for admission, routing, cache, interpretation, retrieval branches,
reranking, policy, model prefill/decode where available, tools, and response.
Propagate trace context across queues. Record duration, status, route, artifact
versions, token counts, candidate counts, and fallback reason.

Do not attach raw prompts, source documents, secrets, or generated personal data
by default. Use approved redaction, sampling, access control, and retention.

## Metrics explain populations

Track request rate, errors, duration, saturation, and queue depth plus TTFT,
inter-token latency, input/output tokens, cache hit/eviction, batch occupancy,
model route, fallback, index age, constraint violations, quality audit, and cost.
Dashboards need p50/p95/p99 and distributions by bounded route/version/tenant tier.

Avoid high-cardinality labels such as request ID, query, user, document, prompt,
or full model output. They can make metrics expensive and leak data. Put request
IDs in sampled secure logs/traces.

## Logs preserve decisions

Structured events should identify request/trace, approved subject class, route,
versions, decision/fallback code, counts, latency, and error class. Centralize
redaction and test it. Never log credentials or provider authorization headers.

## Quality and cost need delayed joins

Operational telemetry is immediate; relevance labels and product outcomes arrive
later. Join through privacy-reviewed stable IDs and experiment assignments. Keep
proxy metrics labeled as proxies.

**Checkpoint:** Define a dashboard and three alerts that distinguish dependency
failure, capacity saturation, and quality drift. Each alert needs owner and
runbook, not only a chart.
