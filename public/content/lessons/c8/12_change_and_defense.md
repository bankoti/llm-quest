# 12 - Post-Launch Change, Drift, and Final Defense

A system is not complete at first launch. Simulate one month later: add a locale,
vertical, policy, catalog schema, traffic shift, provider version, or embedding
model. Detect the change through monitoring and run the appropriate data,
evaluation, security, capacity, and release gates again.

## Second release

Do not mutate historical artifacts. Create new manifests and compare stable
regression plus rolling recent sets. Recalibrate thresholds, re-embed compatible
indexes, invalidate caches, update risks/runbooks, and canary. Show why unchanged
evidence remains valid and which evidence expires.

## Final portfolio

- charter and acceptance matrix;
- product brief, diagrams, ADR, and SLOs;
- data/model cards and reproducible manifests;
- code/tests plus quality, calibration, load, cost, and security reports;
- failure matrix, dashboards, alerts, runbooks, release and rollback evidence;
- experiment plan, incident postmortem, and second-release change log;
- one-page executive decision and detailed technical appendix.

## Defense

In 30 minutes: state problem and non-goals, demonstrate baseline/enhanced/fallback,
trace one result to data/model/index versions, explain the highest residual risk,
show launch evidence and rollback, then respond to a changed constraint and an
injected failure.

## Passing standard

Another engineer can reproduce results from source and manifests, operate the
service from runbooks, understand unsupported claims, and rollback safely. The
architecture changes coherently when constraints change. Complexity without
measured value is removed.

This is the specialization’s “production” outcome: not a claim that synthetic
software is ready for real users, but a complete, auditable method for earning
that decision in a real organization.

> **Note:** everything you defended here assumed one model answering one
> request. The systems being shipped in 2026 increasingly do not look like
> that: they are agent loops, a model calling tools, reading results, and
> deciding what to do next, often across multiple models coordinated over
> protocols like MCP. Every discipline in this capstone (fallbacks, budgets,
> launch gates, failure matrices) transfers directly, and the failure surface
> gets bigger. That is the next course: LLM Agents, the first expansion
> beyond these fundamentals.
