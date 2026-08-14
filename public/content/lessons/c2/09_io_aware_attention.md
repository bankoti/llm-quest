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

Complete the challenge below. Compute the bytes required by a naive score
matrix and compare them with a tiled algorithm's on-chip tile. This exercise is a
traffic model, not a claim about wall-clock speed.

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
