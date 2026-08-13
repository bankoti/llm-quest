# 03 - Hybrid, Learned Sparse, and Late-Interaction Retrieval

Lexical and dense systems fail differently. Hybrid retrieval runs multiple
candidate generators and combines their evidence. Reciprocal-rank fusion (RRF)
avoids treating incomparable raw scores as calibrated:

```text
RRF(d) = sum(r in retrievers) 1 / (k + rank_r(d))
```

A document returned by several retrievers accumulates support. `k` controls how
quickly contribution falls with rank. Deduplicate by stable document or product
ID and retain source ranks for explanation and debugging.

## Alternatives between sparse and dense

Learned sparse retrieval such as SPLADE produces vocabulary-space sparse weights.
It can learn expansion terms while retaining inverted-index execution and some
term-level inspectability. Its indexing distribution and regularization matter;
it is not simply BM25 with synonyms.

Late-interaction systems such as ColBERT encode query and document token vectors
separately, then aggregate per-query-token maximum similarities. They preserve
finer token interaction than one pooled vector while allowing document
precomputation. The cost is a larger index and more expensive candidate scoring.

These are architecture options on a continuum:

| Method | Stored item representation | Interaction | Typical tradeoff |
|---|---|---|---|
| BM25 | sparse terms | exact term scoring | vocabulary mismatch |
| SPLADE-like | learned sparse terms | weighted overlap | expansion/index cost |
| dual encoder | one/few dense vectors | global similarity | interaction bottleneck |
| ColBERT-like | token vectors | late MaxSim | storage and rerank work |
| cross-encoder | raw pair | full joint attention | cannot scan whole corpus |

Complete `workbook/03_rank_fusion.py`. Test duplicate IDs, absent documents,
empty rankings, and deterministic ties.

**Checkpoint:** Evaluate each candidate source alone and fused. A fusion gain is
meaningful only if it survives critical slices and latency budget.
