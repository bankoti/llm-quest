# 04 - Axes & Matmul: NumPy & Torch

Attention is one matmul, a mask, and a row-wise softmax. MoE routing is one
matmul and a row-wise argmax. If you can control which axis an array
operation runs along, Courses 1 through 3 become assembly work. Most array
confusion is axis confusion; this level ends it, in both dialects you will
meet: NumPy (what this browser runs) and PyTorch (what the wider world
runs). The two are the same language with different accents.

> **Note:** the in-browser grader runs NumPy only; torch cannot run here.
> Write your challenge solution in NumPy, but read every torch line below,
> because Courses 1+ quote torch-shaped code constantly and real training
> code is torch.

## The axis rule

For a 2D array of shape `(rows, cols)`:

```python
# NumPy                            # Torch
M.sum(axis=0)                      M.sum(dim=0)    # -> shape (cols,)
M.sum(axis=1)                      M.sum(dim=1)    # -> shape (rows,)
```

Remember it as: **the axis you name is the one that disappears.** This rule
carries to `mean`, `max`, `argmax`, and every other reduction unchanged.
The only difference between dialects is the keyword: NumPy says `axis`,
torch says `dim`. Same integer, same rule.

## keepdims and broadcasting

Normalizing rows needs the row sums lined up against the original matrix:

```python
# NumPy
M / M.sum(axis=1)                  # shape (rows,) vs (rows, cols): WRONG alignment
M / M.sum(axis=1, keepdims=True)   # shape (rows, 1): broadcasts correctly

# Torch: identical move, singular keyword
M / M.sum(dim=1, keepdim=True)
```

Broadcasting stretches size-1 dimensions to match, right-aligned, and the
rules are identical in both libraries. A `(rows, 1)` column of sums divides
every row elementwise, which is exactly what softmax does after
exponentiation.

> **Gotcha:** the first form above does not always error. For square
> matrices it runs and silently normalizes the wrong way. Shape bugs that
> run are the expensive ones; `keepdims=True` (torch: `keepdim=True`, no s)
> is the habit that prevents them.

## The @ operator

```python
S = A @ B.T   # A is (n, d), B is (m, d)  ->  S is (n, m)   (both dialects)
```

`@` is matrix multiplication and works unchanged in NumPy and torch.
`A @ B.T` computes the dot product of every row of A with every row of B:
n queries scored against m keys in one operation. This single line opens
Course 1's attention, Course 2's GQA, and Course 5's dense retrieval. The
inner dimensions must match; the result is always outer-by-outer.

> **Tip:** for batched 3D+ tensors, torch prefers `A @ B.transpose(-2, -1)`
> (or `B.mT`) because `.T` reverses every dimension. In 2D, `.T` is safe in
> both dialects, and 2D is all this level needs.

## Masking with -inf

```python
# NumPy
np.where(mask, S, -np.inf)                # keep where True, kill where False

# Torch, two idioms you will see in real code
torch.where(mask, S, float('-inf'))
S.masked_fill(~mask, float('-inf'))
```

`where(cond, a, b)` picks elementwise. Setting banned positions to `-inf`
(rather than 0) matters because a later softmax exponentiates:
`exp(-inf) == 0` exactly, so masked positions get zero attention weight.
Causal masking, padding masks, and top-k filtering all use this move.

## Dialect map, one table

| Operation        | NumPy                        | Torch                          |
|------------------|------------------------------|--------------------------------|
| reduce over axis | `M.sum(axis=0)`              | `M.sum(dim=0)`                 |
| keep the axis    | `keepdims=True`              | `keepdim=True`                 |
| row-wise argmax  | `np.argmax(S, axis=1)`       | `S.argmax(dim=1)`              |
| matmul           | `A @ B.T`                    | `A @ B.T` (2D) / `A @ B.mT`    |
| elementwise pick | `np.where(m, a, b)`          | `torch.where(m, a, b)`         |
| negative inf     | `-np.inf`                    | `float('-inf')`                |
| to Python list   | `arr.tolist()`               | `t.tolist()`                   |

> **Note:** the Reference page (link in the map header) has the full
> tensor-syntax table and the complete torch-to-numpy dialect map.

## Your challenge

Column means, row normalization, pairwise scores with `@`, and -inf
masking: the four moves that make attention a formality. Solve in NumPy;
translating to torch afterward is a keyword swap, and now you know which
keywords.
