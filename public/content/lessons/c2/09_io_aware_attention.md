# 09 - IO-Aware Attention

FlashAttention made exact attention faster by refusing to write a matrix to
memory. Understanding why is the cleanest introduction to a rule that governs
modern inference: arithmetic is cheap, moving bytes is not.

## The apparent contradiction

![IO-aware attention tiling](content/images/c2/io_aware.svg)


The attention equation creates a score matrix with `T * T` entries per head. A
straight implementation writes that matrix to high-bandwidth memory, reads it for
softmax, writes probabilities, then reads them again to multiply by values. For
long sequences, moving these intermediates can cost more time than the arithmetic.

FlashAttention changes this memory schedule while computing exact attention. It
does **not** replace softmax attention with an approximation.

## Online softmax

For scores `s`, ordinary softmax uses:

```text
m = max(s)
l = sum(exp(s - m))
softmax(s_i) = exp(s_i - m) / l
```

Suppose scores arrive in blocks. Maintain a running maximum `m_old`, running
normalizer `l_old`, and partial weighted output `o_old`. For a new block with
maximum `m_block`, choose:

```text
m_new = max(m_old, m_block)
l_new = exp(m_old - m_new) * l_old
      + sum(exp(s_block - m_new))
```

The old contribution is rescaled because the numerical-stability reference
maximum changed. The output accumulator is rescaled the same way. This makes it
possible to tile queries, keys, and values through fast on-chip memory without
materializing the full score or probability matrices in external memory.

## What remains identical

- causal or local masking semantics;
- scaling by `sqrt(head_size)`;
- row-wise softmax;
- the final weighted sum;
- gradients, up to normal floating-point tolerance.

An optimized kernel is correct only if it preserves those semantics. Benchmark
speed and numerical agreement separately.

## Why hardware details matter

Arithmetic throughput, memory bandwidth, on-chip SRAM, tensor-core formats, warp
scheduling, and supported head dimensions determine realized speed. A kernel that
wins on one GPU or dtype may not win on a CPU, an older GPU, short sequences, or
unusual masking. FlashAttention-3 adds Hopper-specific scheduling and low-precision
techniques; that is a systems advance, not a new language-model objective.

## Worked traffic estimate

For one FP16 attention head with `T=4096`, storing only a dense score matrix costs:

```text
4096 * 4096 * 2 bytes = 32 MiB
```

Multiply by batch and heads, then add probabilities and gradients. This simple
estimate explains why avoiding external-memory intermediates matters even though
the number of dot products remains quadratic.

## Experiment

Complete the memory accounting, then implement `tiled_attention(q,k,v,block_size)`.
This CPU reference validates the online-softmax algorithm; it is not a fused GPU
kernel. Storage estimates are not measured traffic or wall-clock speed.

If you have supported hardware, compare PyTorch's explicit attention against
`scaled_dot_product_attention`. Verify output closeness before timing warm runs.
Synchronize the accelerator around measurements and report shapes, dtype, device,
kernel backend, median, and tail latency.

## Failure modes

- Calling every fused attention implementation "FlashAttention."
- Reporting one unsynchronized GPU timing.
- Treating lower allocated memory as proof of equal output.
- Assuming an IO-aware exact kernel makes quadratic compute linear.
- Ignoring padding, mask shape, dropout, dtype, or backward-pass differences.

## Exit check

Explain how exact attention can avoid storing the full score matrix, and name one
architecture property and one hardware property that determine the speedup.

Primary source: [FlashAttention-3](https://arxiv.org/abs/2407.08608).

## Implement the recurrence

For each query tile, initialize one maximum `m=-inf` and exponential sum `l=0`
per row, and weighted value sum `a=0` with shape `(query_rows, value_width)`.
Visit key tiles up to the end of this query tile. Use GLOBAL position indices
to set future scores to `-inf`. The diagonal remains visible.

```text
S = Q_tile @ K_tile.T / sqrt(D), with causal mask
m_new = maximum(m, row_max(S))
alpha = exp(m - m_new)
P = exp(S - m_new[:, None])
l_new = alpha * l + row_sum(P)
a_new = alpha[:, None] * a + P @ V_tile
```

Assign the new statistics after each tile. Return `a/l[:,None]` only after all
allowed tiles. The first key tile includes at least one visible key for each
query row, so its maximum is finite. Skipping fully future tiles also avoids
the undefined expression `-inf - -inf` in an empty accumulator.

For scores `[1,2]` and values `[10,20]`, `m=2`, `l=1+exp(-1)`, and
`a=20+10*exp(-1)`. A later tile with maximum 4 changes the scale: multiply
both previous sums by `exp(2-4)` before adding new contributions. Equal-weight
averaging of two tile outputs would discard their different probability mass.

Implement query tiling as well as key tiling. With tile size B, score storage is
at most B squared (when T>B), with additional row accumulators and input/output
arrays. The grader checks multiple tile sizes, non-divisible lengths, large
logits, and isolation from future values. It cannot prove memory scheduling from
outputs alone; inspect allocations and compare peak memory in the notebook.

**Challenge:** Deliberately remove the `alpha` correction. Explain why a rising
maximum breaks the result even when no NaN appears. The worked solution is
available below the coding arena.

Primary algorithm: [Dao et al., FlashAttention, Algorithm 1](https://arxiv.org/abs/2205.14135).
