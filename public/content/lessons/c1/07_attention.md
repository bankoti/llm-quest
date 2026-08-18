# 07 - Causal self-attention
<!-- challenge: challenges/c1/06_attention.py -->

Attention is a soft dictionary lookup: every position asks a question, every
earlier position advertises what it knows, and the answer is a weighted blend.
The math is four matrix operations; this level makes you own each one.

## The problem attention solves

The bigram model cannot condition on distant tokens. Attention lets each position
construct a weighted mixture of information from earlier positions. The weights
depend on the content of the sequence.

For each token vector `x`, learned linear maps produce:

```text
q = x Wq    query: what am I looking for?
k = x Wk    key:   what do I advertise?
v = x Wv    value: what information do I provide?
```

## The equation

![Attention computation](content/images/c1/attention_flow.svg)


```text
Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k) + mask) V
```

Shape walkthrough for one head:

```text
Q:                 (B, T, D)
K transpose:       (B, D, T)
Q @ K transpose:   (B, T, T)
softmax weights:   (B, T, T)
V:                 (B, T, D)
weights @ V:       (B, T, D)
```

Each row of the `(T, T)` matrix says how one destination position mixes source
positions.

## One head, two tokens, by hand

Use head size D = 1 so every vector is a scalar. Suppose the projections give:

```text
position 1: q = 1   k = 1    v = 10
position 2: q = 2   k = -1   v = 20
```

Position 1 may attend only to itself: its weight row is `[1.0]` and its output
is `10`. Position 2 attends to both. Its raw scores are `q2*k1 = 2` and
`q2*k2 = -2`; softmax over `[2, -2]` gives `[0.982, 0.018]`, so its output is
`0.982*10 + 0.018*20 = 10.18`.

Notice what happened: position 2 mostly copied position 1's value because its
query matched position 1's key. Content decided the mixing. The matrices in
the real implementation just do this for every position at once.

## Why scale

If query and key components have roughly unit variance, their dot product's
variance grows with dimension `D`. Dividing by `sqrt(D)` keeps scores in a range
where softmax has useful gradients instead of becoming nearly one-hot too early.

## Why causal masking

![Causal attention mask](content/images/c1/causal_mask.svg)


At position `t`, a next-token model may use positions `0..t`, never `t+1..`.
Before softmax, disallowed scores become negative infinity, which softmax maps to
zero probability:

```python
mask = torch.tril(torch.ones(T, T))
scores = scores.masked_fill(mask == 0, float("-inf"))
weights = torch.softmax(scores, dim=-1)
```

Line by line:

- `torch.tril` keeps the lower triangle of a matrix of ones: `mask[i, j]` is 1
  exactly where `j <= i`, meaning "position i may look at position j."
- `masked_fill(mask == 0, -inf)` overwrites every score above the diagonal,
  which is every future position, with negative infinity.
- `softmax(..., dim=-1)` turns each row into probabilities. Since
  `e^-inf = 0`, forbidden positions get exactly zero weight.

> **Gotcha:** mask before softmax, not after. Masking afterward leaves rows
> summing to less than one unless they are renormalized.

## Multiple heads

Split width `C` into `H` heads of width `D = C/H`:

```text
(B, T, C) -> (B, H, T, D) -> attention -> (B, H, T, D) -> (B, T, C)
```

Heads have separate projected subspaces. Their outputs are concatenated and mixed
through an output projection. `C` must be divisible by `H`.

## Verify causality

The strongest test changes future tokens while holding a prefix fixed, then
asserts that outputs for the prefix do not change. This is stronger than merely
checking that a triangular mask exists, and it is exactly what the challenge
below checks.

## Build it yourself

Complete the challenge below. Use one head and
explicit matrix operations. Print the attention matrix and verify:

- every row sums to one;
- every position above the causal diagonal is zero;
- changing a future value cannot change an earlier output.

## Exit check

Derive all shapes in the attention equation and explain query, key, and value
without using the words "query," "key," or "value."
