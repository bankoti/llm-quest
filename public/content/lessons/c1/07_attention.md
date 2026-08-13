# 07 - Causal self-attention

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

## Why scale

If query and key components have roughly unit variance, their dot product's
variance grows with dimension `D`. Dividing by `sqrt(D)` keeps scores in a range
where softmax has useful gradients instead of becoming nearly one-hot too early.

## Why causal masking

At position `t`, a next-token model may use positions `0..t`, never `t+1..`.
Before softmax, disallowed scores become negative infinity, which softmax maps to
zero probability:

```python
mask = torch.tril(torch.ones(T, T))
scores = scores.masked_fill(mask == 0, float("-inf"))
weights = torch.softmax(scores, dim=-1)
```

Mask before softmax, not after. Masking afterward leaves rows summing to less than
one unless they are renormalized.

## Multiple heads

Split width `C` into `H` heads of width `D = C/H`:

```text
(B, T, C) -> (B, H, T, D) -> attention -> (B, H, T, D) -> (B, T, C)
```

Heads have separate projected subspaces. Their outputs are concatenated and mixed
through an output projection. `C` must be divisible by `H`.

## Verify causality

The model test changes future tokens while holding a prefix fixed, then asserts
that logits for the prefix do not change. This is stronger than merely checking a
triangular mask exists.

```bash
PYTHONPATH=src python -m unittest tests.test_models.ModelTests.test_gpt_shapes_loss_and_causality -v
```

## Build it yourself

Complete [workbook/06_attention.py](../workbook/06_attention.py). Use one head and
explicit matrix operations. Print the attention matrix and verify:

- every row sums to one;
- every position above the causal diagonal is zero;
- changing a future value cannot change an earlier output.

Only then read `CausalSelfAttention` in `src/mini_llm/models.py`.

## Exit check

Derive all shapes in the attention equation and explain query, key, and value
without using the words "query," "key," or "value."
