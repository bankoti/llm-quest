# 03 - Build the Control Before the Treatment

The baseline is the smallest complete system that can serve users and measure the
target error. In this course it is lexical retrieval over normalized catalog
fields plus deterministic eligibility filters. It is also the fallback for every
later model path.

Run:

```bash
uv run python courses/04_solution_architecture/solutions/02_baseline_report.py
```

`LexicalRetriever` is intentionally small. Its role is to establish contracts:
query in, ranked product IDs out, deterministic behavior for a versioned catalog,
and a report over a frozen query set.

## Freeze evaluation before tuning

Store query, graded relevant IDs, constraint expectations, traffic slice, locale,
and fixture version. Prevent variants of the same query family from leaking
across train and test. Report Recall@K and NDCG@K with zero-result and critical
constraint violation rates. Aggregate scores can hide a complete tail-query
failure, so preserve head, torso, tail, locale, and vertical slices.

## Instrument the path

For every request, log privacy-reviewed fields sufficient to reconstruct:

- request and trace identifier;
- normalized query hash or approved text representation;
- route, component versions, and fallback reason;
- candidate counts and latency by stage;
- output product IDs and provenance;
- errors, timeouts, and policy rejections.

Instrumentation must not quietly retain secrets or full sensitive queries. Define
redaction and sampling at the schema boundary.

## Use the baseline to falsify AI need

![Baseline control experiment](content/images/c4/baseline_control.svg)


Add curated synonyms, field weighting, and deterministic constraints one at a
time. Re-evaluate on the frozen set. If a taxonomy fix resolves most high-severity
failures, do it. Remaining errors then specify what semantic, generative, or
labeling experiment must beat.

**Checkpoint:** Complete the challenge below. Write three failure
examples with query, expected item, actual rank, error class, and likely repair.
Do not summarize only with one score.
