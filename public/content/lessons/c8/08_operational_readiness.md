# 08 - Observability, Alerts, Runbooks, and Ownership

Turn design and failure evidence into daily operations. Create dashboards for
service health, model/inference health, retrieval/index health, quality/safety,
traffic/experiments, and cost/capacity.

## Minimum telemetry

Trace stage spans and versions; expose bounded-cardinality rate/error/duration,
queue, route/fallback, token/cache, saturation, freshness, quality-audit, policy,
and cost metrics; retain structured redacted decision events. Test trace
propagation through queues and verify prohibited content is absent.

Alerts must state condition, window, severity, user impact, owner, and runbook.
Include fast burn for request SLO, fallback spike, queue saturation, index age,
constraint/policy failure, canary regression, cost anomaly, and missing telemetry.
Avoid paging on an unactionable quality proxy without a response path.

## Runbooks

For each alert: confirm impact, segment by route/version/tenant/slice, immediate
mitigation, kill switch/rollback, verification, escalation, communications,
evidence preservation, and recovery. Commands should be reviewed and safe; do not
depend on the broken component for rollback.

Define primary/secondary owners for service, model, data/index, security, and
product decision. Record change approvals and on-call handoff.

The challenge below is the launch review in miniature. It hands you raw
evidence (measured value, threshold, direction) rather than pre-judged
booleans, because that is where real reviews go wrong: for quality, higher
is better; for latency and cost, lower is. Your gate checker must get the
direction right, block the launch on a single failure, and name the gate
that blocked it — "no" is not actionable, "no, because latency_p95" is.

**Exit gate:** alerts fire in drills; every alert has a usable runbook and owner;
operators can identify versions and disable optional AI; telemetry loss itself is
detected without leaking private data.
