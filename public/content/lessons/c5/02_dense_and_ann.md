# 02 - Dense Retrieval and Approximate Nearest Neighbors

A dense retriever maps query `q` and item `d` to vectors and ranks by dot product
or cosine similarity:

```text
cos(q,d) = (q dot d) / (||q|| * ||d||)
```

If vectors are L2-normalized, dot product equals cosine similarity. Training a
dual encoder usually contrasts positive query-item pairs against negatives. Its
independent item encoding enables precomputation and indexing, unlike a
cross-encoder that jointly reads each pair.

The repository’s `HashingSemanticRetriever` hashes character trigrams into a
fixed vector. It is deterministic and catches spelling overlap, but has no learned
semantic supervision. Use it to inspect normalization, collisions, and API
behavior, then replace the adapter in a real experiment.

## Exact versus approximate search

![ANN neighbor search](content/images/c5/ann_space.svg)


Brute-force search compares the query with every item and is an exact control.
Approximate nearest-neighbor (ANN) indexes trade recall for latency and memory.
Graph indexes expose construction and search breadth; inverted or product-
quantized methods partition/compress vectors.

> **Tip:** names do not determine quality. Benchmark the index type and
> parameters on your actual vector distribution.

Measure ANN recall against exact top-K, p50/p95 latency, build time, resident
memory, update/delete behavior, filter selectivity, and recovery. Metadata filters
can reduce recall or increase work depending on whether they apply before,
during, or after ANN traversal.

## Version contract

An embedding index is compatible with the exact encoder, tokenizer, pooling,
normalization, dimensionality, and preprocessing version. Changing any requires
re-embedding or an explicit compatibility proof. Publish an immutable index and
switch an alias after evaluation.

Complete the challenge below. Then perturb one dimension and see
why unnormalized dot product can prefer magnitude rather than direction.

**Checkpoint:** Design an exact-versus-ANN harness with a frozen query sample and
state the minimum recall and maximum p95 that permit publication.
