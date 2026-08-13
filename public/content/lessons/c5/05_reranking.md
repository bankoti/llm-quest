# 05 - Reranking and Hard Negatives

Candidate generation optimizes recall under a broad budget. Reranking spends more
compute on tens or hundreds of candidates to improve top positions. A feature
ranker may combine lexical score, dense score, exact category, freshness, and
popularity. A cross-encoder jointly reads query and item text, enabling richer
interaction at higher per-pair cost.

## Training examples determine behavior

Random negatives are often too easy. Mine hard negatives from:

- high lexical rank but wrong intent (`protein` versus chicken);
- high dense similarity but violated constraint (`vegan chicken` versus meat);
- sibling taxonomy nodes;
- previous model false positives;
- same title with incompatible attributes or locale;
- exposed but skipped candidates, after accounting for click bias.

Do not label every unclicked result irrelevant. It may not have been seen, and
position/popularity affect behavior. Use explicit judgments or debiasing methods
where the decision matters.

## Score and calibrate

Ranking only needs relative order, but downstream thresholds require calibrated
probabilities or confidence. Fit calibration on held-out data and report
reliability by slice. A score from a new model version is not automatically
compatible with the old threshold.

Rerank only eligible candidates and preserve source features. Cap candidates to
meet latency; measure quality versus depth. Batch query-item pairs where the
runtime supports it, and define behavior on timeout: return fused candidates,
not an error.

Complete `workbook/05_rerank.py`, a transparent linear feature ranker. Then add a
feature whose scale is 1,000 times larger and observe why unnormalized features
can dominate.

## Evaluation

Compare candidate Recall@100, reranked NDCG@10/MRR, critical violations, p95
latency, and fallback quality. An NDCG gain is unacceptable if reranking drops a
hard constraint or consumes the whole request reserve.

**Checkpoint:** Build a 20-example hard-negative set where lexical and dense
retrievers fail in opposite directions. Explain how it changes the training
distribution.
