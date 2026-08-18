# 03 - Multi-head, multi-query, and grouped-query attention

At decode time the cache, not the arithmetic, is the bill. Key/value heads set
the size of that bill, and GQA is the knob that controls them.

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

Put numbers on it with a Llama 3 8B shape: 32 layers, head size 128, BF16
(2 bytes per stored number):

```text
MHA (Hkv = 32): 2 * 32 * 32 * 128 * 2 bytes = 512 KiB per token
GQA (Hkv = 8):  2 * 32 *  8 * 128 * 2 bytes = 128 KiB per token
```

At an 8,192-token context that is 4 GiB versus 1 GiB per sequence. The quality
cost of dropping from 32 KV heads to 8 was judged acceptable; the drop to 1
(MQA) often is not. That judgment, rerun for each model family, is why GQA is
the current default.

Level 6 of this course covers the cache mechanics in full. For now it is
enough that cache size scales with `Hkv` and not with `Hq`.

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

## Sliding-window causal mask

Full causal attention lets every position attend to all prior positions. In
long-context models, restricting each token to a local window trades recall of
distant context for a much cheaper attention operation.

The rule: position `t` may attend to position `s` if and only if:

```text
t - window < s  AND  s <= t
```

In matrix form, `mask[t, s] = True` where both conditions hold. Outside the
window and above the diagonal, the mask is `False`.

```python
def causal_mask(length, window=None):
    # full causal: no window
    m = np.tril(np.ones((length, length), dtype=bool))
    if window is not None:
        # additionally exclude positions more than `window` steps back
        m &= np.triu(m, -(window))
    return m
```

When `window=None`, this degenerates to the standard lower-triangular causal
mask. The challenge below asks you to implement both variants.

## Exercise

In the challenge below, calculate the KV cache ratio for
`Hq=32` with `Hkv` equal to 32, 8, and 1. Then implement KV-head repetition and
verify the exact output head ordering. Finally, implement the `causal_mask`
function with the optional sliding-window parameter described above.

## Exit check

Explain why reducing KV heads changes cache memory more directly than reducing
query heads, and why `Hq` must be divisible by `Hkv` in this implementation.
