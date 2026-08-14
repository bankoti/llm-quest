# 03 - Multi-head, multi-query, and grouped-query attention

## The design axis

![MHA vs GQA vs MQA](content/images/c2/gqa_heads.svg)


Let `Hq` be query heads and `Hkv` be key/value heads.

```text
MHA: Hkv = Hq
GQA: 1 < Hkv < Hq
MQA: Hkv = 1
```

Every query head still produces its own query. Key and value heads are shared by
groups of query heads. If `Hq=8` and `Hkv=2`, each KV head serves four query heads.

## Why KV heads matter during inference

Autoregressive decoding stores past keys and values for every layer. Ignoring
batching and precision details, cache elements per token are proportional to:

```text
2 * layers * Hkv * head_size
```

Reducing `Hkv` lowers cache memory and the bandwidth needed to read it each decode
step. Query activations are produced only for the current token and are not cached.

## Tensor flow

```text
Q projection: (B,T,C) -> (B,Hq,T,D)
K,V projection: (B,T,C) -> (B,Hkv,T,D)
repeat each KV head Hq/Hkv times
scores: (B,Hq,T,D) @ (B,Hq,D,T) -> (B,Hq,T,T)
```

The repeat in the educational implementation is conceptually clear but may
materialize data. Optimized kernels support grouped heads without physically
copying the KV tensors.

## Capacity tradeoff

MHA gives each query head independent key/value projections. MQA maximizes sharing.
GQA sits between them and was introduced as a quality/speed compromise. This is an
empirical architecture decision, not a theorem that one setting always wins.

## Exercise

Complete `workbook/02_gqa_and_masks.py`, Part A. Calculate the KV cache ratio for
`Hq=32` with `Hkv` equal to 32, 8, and 1. Then implement KV-head repetition and
verify the exact output head ordering.

## Exit check

Explain why reducing KV heads changes cache memory more directly than reducing
query heads, and why `Hq` must be divisible by `Hkv` in this implementation.
