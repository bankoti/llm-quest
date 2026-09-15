# 01 - Scaling Laws

## The core observation

Training loss on held-out text falls predictably as you increase model size,
dataset size, and compute. Kaplan et al. (2020) showed the relationship is a
power law in each axis. Hoffmann et al. (2022), the Chinchilla paper, refined
it: the compute-optimal frontier requires roughly equal token and parameter
scaling. For a fixed compute budget `C` (FLOPs), the optimal model trains
approximately `N* = sqrt(C / 120)` parameters on `D* = 20 * N*` tokens
under the simplifying assumptions `D/N = 20` and `C = 6ND`. This is a
planning approximation, not a universal fitted law for every architecture.

```text
Compute budget C  (FLOPs, from training run)
Optimal params  N* = sqrt(C / 120)   # ≈ 0.091 * sqrt(C)
Optimal tokens  D* = 20 * N*
```

A quick sanity check: 6 * N* * D* = 6 * N* * 20 * N* = 120 * N*^2 = 120 * (C/120) = C. The
compute budget is fully used. GPT-3 (175B params, ~300B tokens) trained parameter-heavy
relative to tokens. Chinchilla (70B params, 1.4T tokens) used a 20:1 token-to-parameter
ratio. It outperformed the larger 280B-parameter Gopher across the reported
evaluation suite at a comparable training-compute budget.

## What the law measures and what it does not

The empirical fits describe held-out language-model loss over the runs studied.
They do not directly predict:

- performance on a specific downstream task;
- emergent capabilities that appear discontinuously at scale;
- the effect of data quality, domain mix, or deduplication.

Data and architecture changes can alter the fit. Some deployment-focused recipes
train longer to reduce inference cost; 20 tokens per parameter is not a hard
minimum or maximum.

## Flop arithmetic

A transformer forward pass through one parameter requires roughly 2 FLOPs.
Training adds the backward pass: approximately 6 FLOPs per parameter per token.

```text
Training FLOPs ≈ 6 * N * D
```

This rough estimate omits details such as attention's sequence-length cost,
optimizer arithmetic, and recomputation. Measure compute or use a fuller cost
model when those terms matter.

## Why this matters for architecture choice

If data is abundant and compute is fixed, Chinchilla scaling favors smaller
models trained longer. Llama 3 8B was trained on 15T tokens, roughly 94x
the 20:1 allocation for its parameter count (15T / 160B is about 94), illustrating
why the training-only allocation need not be the deployment choice.

## Exit check

Given a training compute budget of 1e23 FLOPs, derive the Chinchilla-optimal
parameter count and token count. Then explain why a production team might
choose to train half as many parameters on twice as many tokens instead.

## Build an equal-budget experiment

Finish `budget_tokens(C, N) = floor(C/(6N))`. For each candidate N, compute
its own D; copying one D across models changes the compute budget. Check:
`6ND <= C < 6N(D+1)`. The small rounding remainder is less than one token's
estimated compute. This invariant is what the grader checks.

The experiment notebook trains tiny causal language models at multiple widths
and seeds, with the same token stream, held-out evaluation, and estimated compute
cap. It reports the actual parameter counts, tokens processed, budget utilization,
and validation loss. Learning-rate schedules are matched to each run's duration.
Predict the winner, run it, and explain disagreements with your prediction.

A tiny corpus and short runs do not reproduce the Chinchilla scaling law. Look
for confounders: repeated data, token rounding, optimizer settings, model shape,
validation variance, and uncounted attention work. The correct conclusion may be
that this experiment cannot identify a stable optimum.

Primary source: [Hoffmann et al., Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556).
