# Tensor syntax reference

Every model in this course is built from about a dozen tensor moves. This page
translates each one into plain English so syntax never blocks a concept. Keep it
open in a second tab. Nothing here is graded.

Lessons show PyTorch; challenges grade plain numpy. The ideas are identical and
only some argument names differ: PyTorch says `dim=` and `keepdim=`, numpy says
`axis=` and `keepdims=`. Each entry notes both where they differ.

## Axes and negative indexing

A shape like `(B, T, C)` has axes numbered 0, 1, 2. Negative numbers count from
the end: axis `-1` is the last axis, `-2` is the one before it. In a 4D tensor
`(B, H, T, D)`, axis `-1` is `D` and axis `-2` is `T`.

The course prefers negative axes on purpose: `dim=-1` means "the last axis" no
matter how many batch axes sit in front, so the same line of code works on 2D,
3D, and 4D tensors without edits.

## Slicing

```python
x = torch.randn(2, 5, 12)   # (B, T, C)
x[0]           # first sequence: (5, 12)
x[:, 0]        # first position of every sequence: (2, 12)
x[:, -1, :]    # last position of every sequence: (2, 12)
x[:, :3, :]    # first three positions: (2, 3, 12)
```

Read `:` as "everything on this axis." A negative index counts from the end, so
`x[:, -1]` is the last position. Slicing never changes values, only which values
you are looking at.

## view and reshape

```python
x = torch.randn(2, 5, 12)          # (B, T, C)
y = x.view(2, 5, 3, 4)             # (B, T, H, D): slice C=12 into 3 groups of 4
z = x.reshape(10, 12)              # merge B and T into one axis
```

Both lay the same numbers into a new shape; no value changes. The element count
must match: `2*5*12 = 10*12 = 120`. In numpy the same operation is `reshape`.

Gotcha: after a `transpose`, PyTorch's `view` can fail because the logical order
no longer matches memory order. Call `.contiguous()` first, or use `reshape`,
which handles it for you.

## transpose: swapping axes

```python
x = torch.randn(2, 3, 8, 4)        # (B, H, T, D)
x.transpose(1, 2).shape            # (2, 8, 3, 4): axes 1 and 2 swapped
x.transpose(-2, -1).shape          # (2, 3, 4, 8): last two axes swapped
```

`transpose(a, b)` swaps exactly two axes and touches nothing else. The idiom
`transpose(-2, -1)` means "swap the last two axes" and appears before almost
every matrix multiplication, because `@` needs the inner axes to line up (next
entry).

In numpy: `x.swapaxes(-2, -1)`, or `x.T` for a plain 2D matrix.

## The @ operator: matrix multiplication

For 2D matrices the rule is `(m, n) @ (n, p) -> (m, p)`: inner axes must match
and disappear; outer axes remain. Row i of the result is "row i of the left
matrix, dotted with every column of the right matrix."

With more dimensions, `@` applies that same rule to the **last two axes** and
treats everything in front as batch:

```python
q = torch.randn(2, 3, 8, 4)        # (B, H, T, D)
k = torch.randn(2, 3, 8, 4)        # (B, H, T, D)
scores = q @ k.transpose(-2, -1)   # (B, H, T, D) @ (B, H, D, T) -> (B, H, T, T)
```

Read that line in plain English: "for every batch and head, dot every query
row against every key row." The transpose exists only to satisfy the
inner-axes-must-match rule; the concept is "all pairwise dot products."
`scores[b, h, i, j]` is one number: how strongly position i's query matches
position j's key.

## Broadcasting

When shapes differ, both libraries line shapes up from the right and virtually
repeat any axis of size 1 (or any missing axis):

```python
a = torch.tensor([[1., 2.], [3., 4.]])   # (2, 2)
b = torch.tensor([10., 20.])             # (2,)
a + b                                     # [[11, 22], [13, 24]]
```

`b` is stretched across both rows. No copy is made; it is a view trick. The
common course pattern is adding a `(T, C)` position table to a `(B, T, C)`
activation: the missing `B` axis broadcasts.

## Reductions: sum and mean

```python
counts = torch.tensor([[1., 3.], [2., 2.]])   # (2, 2)
counts.sum(dim=1)                  # [4., 4.]        shape (2,)
counts.sum(dim=1, keepdim=True)    # [[4.], [4.]]    shape (2, 1)
```

`dim=1` (numpy: `axis=1`) means "collapse axis 1": each row becomes one number.
The axis you name is the one that disappears.

`keepdim=True` (numpy: `keepdims=True`) keeps the collapsed axis as size 1.
That matters for the next step: `counts / counts.sum(dim=1, keepdim=True)`
broadcasts the `(2, 1)` row totals back across each row, turning counts into
row-wise probabilities. Without `keepdim` the shapes would misalign.

## Softmax and dim=-1

```python
weights = torch.softmax(scores, dim=-1)
```

Softmax exponentiates and normalizes so values become positive and sum to 1.
`dim=-1` says which axis becomes a probability distribution: the last one. For
attention scores of shape `(B, H, T, T)`, that means **each row of the T x T
score matrix** sums to 1: every query position distributes 100% of its
attention across key positions.

Numpy has no built-in softmax; the challenges write it out with the standard
stability trick (subtract the max before exponentiating, which changes nothing
mathematically because softmax is shift-invariant):

```python
z = scores - scores.max(axis=-1, keepdims=True)
weights = np.exp(z) / np.exp(z).sum(axis=-1, keepdims=True)
```

## Masking: tril, masked_fill, -inf

```python
mask = torch.tril(torch.ones(4, 4))               # 1s on and below the diagonal
scores = scores.masked_fill(mask == 0, float("-inf"))
```

`tril` keeps the lower triangle: `mask[i, j]` is 1 where `j <= i`, meaning
"position i may look at position j." `masked_fill(condition, value)` writes
`value` wherever the condition is true, so every score above the diagonal
becomes negative infinity. Softmax then maps those to exactly 0 probability:
`e^-inf = 0`. That is the whole causal mask.

Numpy spelling of the same:

```python
mask = np.tril(np.ones((T, T)))
scores = np.where(mask == 0, -np.inf, scores)
```

## Creating tensors

```python
torch.randn(2, 3)     # random normal values, shape (2, 3): fake activations
torch.zeros(4, 4)     # all zeros
torch.ones(4, 4)      # all ones: the usual input to tril
torch.arange(5)       # [0, 1, 2, 3, 4]: positions 0..T-1 for embeddings
```

`randn` appears constantly in lessons because it makes a tensor of the right
shape when only the shape matters for the point being made.

## Elementwise math

`+ - * /`, `np.exp`, `np.sqrt`, and `** 2` all apply to every element
independently and never change the shape. `scores / np.sqrt(D)` divides every
score by the same scalar. If a line contains no `@` and no reduction, the
output shape equals the input shape.

## Read it out loud

When a line stalls you, translate it before tracing it:

| Code | Say it as |
| --- | --- |
| `k.transpose(-2, -1)` | swap the last two axes |
| `q @ k.transpose(-2, -1)` | every query dotted with every key |
| `x.sum(dim=-1, keepdim=True)` | total up each row, keep the axis so division lines up |
| `softmax(scores, dim=-1)` | turn each row into probabilities |
| `masked_fill(mask == 0, -inf)` | forbid these positions; softmax will zero them |
| `x.view(B, T, H, D)` | same numbers, regrouped |
| `x[:, -1, :]` | the last position of every sequence |

If a shape still surprises you after translating, write the shapes above each
line and apply two rules: `@` eats the inner pair of axes, reductions delete
the axis you name. Those two rules explain every shape in this course.
