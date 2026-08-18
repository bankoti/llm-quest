# 03 - Metrics, Slices, and Uncertainty

Choose metrics from the decision. Candidate systems need Recall@K; ranked lists
need NDCG, MRR, or precision; classifiers need precision/recall and severity;
generators need task correctness plus groundedness and citation measures.

For graded gains `rel_i`:

```text
DCG@K  = sum(i=1..K) (2^rel_i - 1) / log2(i + 1)
NDCG@K = DCG@K / ideal_DCG@K
```

Some teaching code uses binary gains. Record the exact definition. Empty-query
and no-relevant-item behavior must be explicit or different libraries will
disagree.

Trace one by hand before writing code. Ranked list `[d1, d2, d3]`, binary
gains, `d2` and `d3` relevant, `d1` not:

```text
pos 1: (2^0 - 1) / log2(2) = 0 / 1.000 = 0
pos 2: (2^1 - 1) / log2(3) = 1 / 1.585 = 0.631
pos 3: (2^1 - 1) / log2(4) = 1 / 2.000 = 0.500
DCG@3 = 1.131

ideal order puts both relevant docs first:
IDCG@3 = 1/1.000 + 1/1.585 = 1.631
NDCG@3 = 1.131 / 1.631 = 0.693
```

Same three documents, one irrelevant doc parked at the top, and 31% of the
credit is gone. That is the position discount doing its job: users read
top-down, so mistakes at the top cost more. The test grades this exact
trace.

Complete the challenge below. Edge behavior is part of the contract:
`k=0` and no-relevant-docs both return 0 rather than dividing by zero,
and each position scores independently (a duplicated id earns its gain
again; deduplicate upstream, not inside the metric).

## Compare paired outputs

![Metric confidence intervals](content/images/c6/uncertainty_bars.svg)


Evaluate systems on the same rows and analyze per-query differences. Paired
bootstrap resampling can estimate a confidence interval for metric delta without
assuming independent result positions. For binary events, report numerator,
denominator, and interval, not only percentages.

Statistical significance does not imply practical value. Predeclare a minimum
effect and non-inferiority margin. Correct for repeated comparisons or restrict
the final decision to a small hypothesis set.

## Slice without hiding sample size

Report head/torso/tail, locale, vertical, constraint, source age, and route with
row counts. A slice of five can reveal a serious scenario but cannot estimate a
stable rate. Treat high-severity observed failures as incidents even when formal
power is low.

## Composite score warning

> **Warning:** do not average quality, latency, safety, and cost into one
> number that permits tradeoff through a critical gate. Use a dashboard: hard
> guardrails first, then optimize the primary metric among survivors.

**Think it through (ungraded):** Write the decision rule before viewing final results, including
how inconclusive confidence intervals are handled.
