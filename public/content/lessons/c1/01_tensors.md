# 01 - Python, tensors, and shapes

Every bug you will hit in this course, from a silent broadcasting mistake to a
leaky attention mask, shows up first as a wrong shape. Learn to predict shapes
before running code and you get a free debugger for everything that follows.

## Why tensors

![Tensors and shapes](content/images/c1/tensors_shapes.svg)


A tensor is a rectangular collection of numbers. Its **shape** tells how many
indices are required to select a value.

```python
import torch

scalar = torch.tensor(3.0)                  # shape: ()
vector = torch.tensor([1.0, 2.0, 3.0])      # shape: (3,)
matrix = torch.tensor([[1, 2], [3, 4]])     # shape: (2, 2)
batch = torch.zeros(4, 8, 32)               # shape: (B=4, T=8, C=32)
```

In this course:

- `B` means independent sequences in one batch;
- `T` means token positions in each sequence;
- `C` means channels: how many numbers describe each position.

Two more letters join later, each when its concept arrives: `V` (vocabulary
size) with the tokenizer in the next level, and `H` (attention heads) when you
build attention in level 6.

## Indexing and slicing

Given `x` with shape `(B, T, C)`:

```python
x[0]          # first sequence: (T, C)
x[:, 0]       # first position in every sequence: (B, C)
x[:, :, 0]    # first channel everywhere: (B, T)
x[:, -4:, :]  # last four positions: (B, 4, C)
```

A colon means "all values on this axis." A negative index counts from the end.

## Reshape, transpose, and contiguous

A preview of level 6: attention will split the `C` channels into `H`
independent heads, turning `(B, T, C)` into `(B, H, T, C/H)`. You do not need
to know why yet; the point here is the reshape itself:

```python
B, T, C, H = 2, 5, 12, 3
x = torch.randn(B, T, C)
heads = x.view(B, T, H, C // H).transpose(1, 2)
assert heads.shape == (B, H, T, C // H)
```

`view` reorganizes axes without changing values. `transpose` swaps axes. After a
transpose, call `.contiguous()` before a later `view` because the logical order
may differ from memory order.

## Broadcasting

PyTorch can combine compatible shapes by virtually repeating dimensions:

```python
token_vectors = torch.randn(2, 5, 12)  # (B, T, C)
position_bias = torch.randn(5, 12)      # (T, C)
combined = token_vectors + position_bias
assert combined.shape == (2, 5, 12)
```

The missing batch axis is broadcast across both sequences.

## Matrix multiplication

For matrices, `(m, n) @ (n, p) -> (m, p)`. The inner dimensions must match.
PyTorch applies the same rule to the final two axes and broadcasts earlier axes.
The variable names below come from attention, where every position scores every
other position; for now they are just tensors with shapes.

```python
queries = torch.randn(2, 4, 8, 16)  # (B, H, T, head_size)
keys = torch.randn(2, 4, 8, 16)
scores = queries @ keys.transpose(-2, -1)
assert scores.shape == (2, 4, 8, 8)
```

Every query position now has one score for every key position.

## Trace one by hand

Predict both results before reading the answers:

```python
a = torch.tensor([[1., 2.], [3., 4.]])   # (2, 2)
b = torch.tensor([10., 20.])             # (2,)

a + b        # broadcasting
a @ b        # matrix-vector product
```

`a + b` stretches `b` across both rows: `[[11, 22], [13, 24]]`, shape `(2, 2)`.
`a @ b` treats `b` as a column. Row one gives `1*10 + 2*20 = 50`, row two gives
`3*10 + 4*20 = 110`, so the result is `[50., 110.]` with shape `(2,)`.

If you predicted both shapes and at least one value, you are ready for the
challenge. If either surprised you, reread the two sections above; those two
rules explain every shape in this course.

## Parameters and gradients

`torch.nn.Parameter` is a tensor an optimizer may update. After `loss.backward()`,
its `.grad` stores the derivative of loss with respect to that parameter.

```python
w = torch.nn.Parameter(torch.tensor(2.0))
loss = (w - 7) ** 2
loss.backward()
print(w.grad)  # -10: increasing w will reduce the loss
```

## Build it yourself

Complete the challenge below. Before every
assertion, write the expected shape on paper.

## Exit check

Explain why `(B, H, T, D) @ (B, H, D, T)` produces `(B, H, T, T)`. If you
cannot explain every axis, repeat the matrix multiplication section.
