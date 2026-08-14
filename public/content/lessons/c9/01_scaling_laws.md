# 01 - Scaling Laws

## The core observation

Training loss on held-out text falls predictably as you increase model size,
dataset size, and compute. Kaplan et al. (2020) showed the relationship is a
power law in each axis. Hoffmann et al. (2022), the Chinchilla paper, refined
it: the compute-optimal frontier requires roughly equal token and parameter
scaling. For a fixed compute budget `C` (FLOPs), the optimal model trains
approximately `N* = 0.2 * sqrt(C)` parameters on `D* = 10 * N*` tokens.

```text
Compute budget C  (FLOPs, from training run)
Optimal params  N* = 0.2 * sqrt(C)
Optimal tokens  D* = 10 * N*
```

GPT-3 (175B params, ~300B tokens) trained parameter-heavy relative to tokens.
Chinchilla (70B params, 1.4T tokens) matched its loss at one-third the
parameters by spending the same compute on more tokens instead.

## What the law measures and what it does not

The power law holds for cross-entropy on the training distribution under
standard autoregressive pretraining. It does not directly predict:

- performance on a specific downstream task;
- emergent capabilities that appear discontinuously at scale;
- the effect of data quality, domain mix, or deduplication.

Those factors shift the prefactor and exponent rather than breaking the form.
Practical recipes treat Chinchilla as a lower bound on token count, not a
ceiling.

## Flop arithmetic

A transformer forward pass through one parameter requires roughly 2 FLOPs.
Training adds the backward pass: approximately 6 FLOPs per parameter per token.

```text
Training FLOPs ≈ 6 * N * D
```

This estimate ignores optimizer state and is accurate within 2x for most
transformer configurations.

## Why this matters for architecture choice

If data is abundant and compute is fixed, Chinchilla scaling favors smaller
models trained longer. Llama 3 8B was trained on 15T tokens, roughly 20x
the Chinchilla optimum for its parameter count, because inference cost, not
training cost, is the binding production constraint.

## Exit check

Given a training compute budget of 1e23 FLOPs, derive the Chinchilla-optimal
parameter count and token count. Then explain why a production team might
choose to train half as many parameters on twice as many tokens instead.
