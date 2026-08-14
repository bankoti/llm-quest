# 04 - From token IDs to training batches

## Inputs and targets are shifted

![Input and target windows](content/images/c1/xy_windows.svg)


Suppose the encoded corpus is:

```text
[12, 7, 4, 4, 9, 2]
```

With a block size of five:

```text
inputs  = [12, 7, 4, 4, 9]
targets = [ 7, 4, 4, 9, 2]
```

The pair contains five supervised predictions. At position two, for example, the
model sees the context up through token `4` and predicts the following `4`.

## The three important dimensions

`TokenDataset.sample` returns:

```text
inputs:  (B, T)
targets: (B, T)
```

After embedding, inputs become `(B, T, C)`. The model eventually returns logits
with shape `(B, T, V)`.

## Random windows

The corpus contains many overlapping context windows. Materializing all of them
wastes storage, so the data loader samples start positions and slices windows on
demand. Sampling approximately shuffles examples while keeping tokens inside each
window in their original order.

## Split before sampling

The course makes one contiguous train/validation split and then samples windows
inside each region. If you create all overlapping windows first and randomly split
them, nearly identical windows can land in both sets, making validation look
better than true generalization.

For larger systems, splits may also be document-aware, time-aware, source-aware,
and deduplicated across boundaries.

## Context length

The block size controls how far the model can look back. Standard attention builds
a `(T, T)` score matrix per head, so doubling `T` roughly quadruples that part of
the work and memory.

Short context:

- cheaper training and larger batches;
- fewer long-range dependencies available.

Long context:

- more relevant history can fit;
- higher compute and memory cost;
- requires data containing useful long relationships.

## The invariant to verify

However batches are produced, targets are inputs shifted one position left:

```python
assert torch.equal(x[:, 1:], y[:, :-1])
```

Concretely, for tokens `[10, 11, 12, 13]` and block size 3, one window is
`x = [10, 11, 12]` with `y = [11, 12, 13]`: at every position the model is
trained to predict the very next token.

## Build it yourself

Complete the challenge below. Add a deliberate
off-by-one bug, observe which assertion catches it, and then repair it.

## Exit check

For batch size 16, block size 64, embedding width 128, and vocabulary 80, state
the shapes of token inputs, embeddings, and logits. Explain why validation windows
must not overlap training text.
