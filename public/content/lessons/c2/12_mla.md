# 12 - Multi-head Latent Attention (MLA)

GQA cut KV heads from 32 to 8, a 4x saving. With a 128K-token context that is
still 3 GB of KV per sequence. Sequence length is the new bottleneck and GQA
cannot touch it. MLA compresses K and V into a single low-rank latent vector,
cutting cache by 98.4% on the DeepSeek-V2 numbers (d_c = 512 vs 128 heads × 128 dims × 2 = 32,768 bytes per token → 64× reduction).

## The core idea

Standard attention projects hidden state `x` into separate K and V matrices,
then caches every layer's K and V for the whole sequence. Those matrices grow
linearly with context length regardless of how many KV heads you use.

MLA replaces the separate projections with a two-step scheme:

```text
Compress:  c_KV = x  @ W_DKV    # (B, T, C) -> (B, T, d_c)
Expand K:  K    = c_KV @ W_UK   # (B, T, d_c) -> (B, T, H_kv * D)
Expand V:  V    = c_KV @ W_UV   # (B, T, d_c) -> (B, T, H_kv * D)
```

During autoregressive decoding, only `c_KV` is appended to the cache at each
step. `K` and `V` are reconstructed on the fly via the learned `W_UK`/`W_UV`
weight matrices, which are fixed and stay in SRAM.

## Why this shrinks the cache

The key comparison is per-token cache size:

```text
GQA cache per token (per layer) = 2 * H_kv * D   (K and V)
MLA cache per token (per layer) = d_c
```

DeepSeek-V2 uses `d_c = 512`, `H_kv = 128` (full-rank KV would be
`128 * 128 * 2 = 32768`), which is a 64x reduction in cache. That matches
the reported 93.3% reduction versus its MHA baseline.

> **Note:** MLA and GQA solve the same problem from different directions. GQA
> shares heads across query groups; MLA compresses the whole KV representation
> into a latent. DeepSeek models use MLA; Llama/Mistral use GQA. Both appear
> on real hardware today.

## The query side

The same compression applies to queries during prefill:

```text
c_Q = x @ W_DQ     # (B, T, C) -> (B, T, d_q)
Q   = c_Q @ W_UQ   # (B, T, d_q) -> (B, T, H_q * D)
```

Queries are not cached (only the current token's Q matters at each decode
step), so the query latent is a compute optimization, not a memory one.

## RoPE and the decoupled key

Applying rotary position embeddings to `K` reconstructed from `c_KV` would
work, but it breaks the cache: if K is reconstructed from `c_KV` and then
rotated by a position-dependent angle, the cached `c_KV` no longer contains
the final positional information. You would have to re-derive K from c_KV
for every new query position, defeating the purpose.

DeepSeek-V2 solves this by computing a small positional-only key `k_rope`
(dimension `d_rope << D`) alongside the content key reconstructed from
`c_KV`. The full key that enters attention is the concatenation. For this
course the challenge focuses on the latent projection mechanics; RoPE
decoupling is a detail that matters for implementation but not for
understanding why MLA reduces cache.

> **Gotcha:** do not confuse `d_c` (latent dimension, controls cache size)
> with `d_rope` (rotary dimension, controls positional resolution). They are
> separate hyperparameters. Increasing `d_c` costs cache bytes; increasing
> `d_rope` costs attention compute per head.

## Reconstruction cost

Expanding from `c_KV` to full K and V requires two matrix multiplications per
layer per decode step. For small `d_c` this is cheaper than reading a full KV
cache that no longer fits in L2 cache. When the full KV would spill to HBM
(or worse, CPU/NVMe), the reconstruction cost is negligible against the memory
bandwidth saved.

## Putting numbers on it

Worked example: a 128K-token context, batch 4, 60 layers, BF16.

```text
Standard KV (128 heads, D=128):   [K only; multiply by 2 for full K+V]
  128K x 4 x 60 x 128 x 128 x 2 bytes = 1,006 GB

GQA (8 KV heads):                  [K only; multiply by 2 for full K+V]
  128K x 4 x 60 x 8 x 128 x 2 bytes = 62.9 GB

MLA (d_c=512):                     [single latent, no K+V split]
  128K x 4 x 60 x 512 x 2 bytes = 31.5 GB
```

The table is a single-tensor comparison (K-only for Standard/GQA; the latent
for MLA), which is why there is no leading `2 ×` on the first two rows. Each
row answers "how many bytes grow with context per batch sequence?" — the ratio
stays the same whether you count K alone or K+V.

MLA is ~2x better than GQA here and ~32x better than MHA. The gap versus GQA
widens as context grows because both grow linearly in T but MLA's constant
`d_c` is smaller than GQA's `2 * H_kv * D`.

## Your challenge

Implement the compress-expand projections, the per-step cache update, and the
cache sizing formula. Then calculate the reduction factor against a standard
GQA cache for a given model shape.
