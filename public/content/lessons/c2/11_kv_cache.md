# 11 - KV Caches and Autoregressive Decoding

## Why caching works

During causal decoding, keys and values for an existing prefix do not change when
one new token is appended. Recomputing them is redundant. A cache stores per-layer
K and V tensors from prefill and appends one position on each decode step.

```text
prefill(prompt) -> logits, [(K_0,V_0), ..., (K_L,V_L)]
decode(token, cache) -> next_logits, updated_cache
```

Queries are not cached for ordinary decoding because only the newest query is
needed. Cached keys and values remain addressable by that query.

## Shapes

For batch `B`, KV heads `H_kv`, cached tokens `T`, and head size `D`:

```text
K_layer: (B, H_kv, T, D)
V_layer: (B, H_kv, T, D)
```

Appending one token increases `T` by one. Beam search or parallel sampling may
copy, share, or reorder cache blocks, which makes cache ownership part of the
serving design.

## Worked memory example

Consider 32 layers, 8 KV heads, head size 128, 8192 tokens, and BF16:

```text
2 * 32 * 8192 * 8 * 128 * 2 bytes = 1 GiB per sequence
```

With 32 query heads, MHA would use four times as many KV heads and about 4 GiB.
This is why GQA is a serving decision as well as a representation decision.

## Correctness contract

Before benchmarking, compare cached and uncached logits for the same token stream:

1. disable dropout and sampling;
2. prefill the same prefix;
3. decode one token at a time;
4. compare every step's logits within dtype-appropriate tolerance;
5. test cache truncation, batch reorder, and maximum length;
6. verify position indices advance exactly once.

A cache can be fast and wrong through an off-by-one position, stale batch slot,
incorrect RoPE offset, or mismatched mask.

## Serving extensions

- **Paged caches** allocate non-contiguous blocks to reduce fragmentation.
- **Prefix caching** reuses blocks shared by identical prompt prefixes.
- **Quantized KV** reduces bytes but requires quality evaluation and kernels.
- **Sliding eviction** bounds local-layer history.
- **Prefill/decode disaggregation** places compute-heavy prefill and
  bandwidth-heavy decode on different worker pools.

These mechanisms change cache management, not the autoregressive probability
factorization.

## Practice

Complete `workbook/06_kv_cache.py`. Derive cache bytes and the MHA-to-GQA ratio.
Then design, in comments, an equivalence test for `ModernDecoderLM`; the teaching
model intentionally recomputes context, so you must specify the cache API before
optimizing it.

## Exit check

Why does a KV cache usually improve time per output token without reducing model
weight reads? Explain why decode can remain memory-bandwidth bound.
