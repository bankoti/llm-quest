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

Complete `workbook/01_ndcg.py`. Add duplicate IDs, `k=0`, and no-relevance cases.
Decide whether duplicates count once before implementing.

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

Do not average quality, latency, safety, and cost into one number that permits
tradeoff through a critical gate. Use a dashboard: hard guardrails first, then
optimize the primary metric among survivors.

**Checkpoint:** Write the decision rule before viewing final results, including
how inconclusive confidence intervals are handled.
