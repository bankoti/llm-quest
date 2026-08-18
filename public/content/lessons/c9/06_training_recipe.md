# 06 - Training Recipe Defense

## What this level tests

The five prior levels gave you tools: scaling laws, data arithmetic, DPO
loss, GRPO advantages, and config forensics. This level asks you to use them
together under real constraints.

## The scenario

Your organization can afford 2e23 FLOPs of training compute. Serve the
resulting model on a single A100. Your recipe must pass four automated
checks:

1. Compute budget: `6 * N * D <= 2e23`
2. Memory: model weights fit in 40GB GPU memory at bfloat16
3. KV cache: 64 concurrent 2048-token contexts fit in what the weights leave free
4. Alignment: DPO beta is in (0, 1] and the chosen/rejected log-prob gap is positive

## What the challenge checks

This boss has two parts, and both are graded.

First you implement `validate()` yourself: the function that turns a recipe
into a `RecipeReport` with one flag per constraint. The grader feeds your
`validate()` known-good and known-bad recipes and checks every flag, so a
`validate()` that waves everything through fails immediately. One subtlety
carries weight: when the weights do not fit in memory, nothing remains for
the KV cache, so `kv_cache_ok` must be False too.

Then you fill in the recipe values, and the grader re-derives every
constraint independently. The numbers must be internally consistent -- you
cannot set N and D independently without also fitting the compute budget.
Start from the binding constraint (memory caps params; params and the FLOPs
budget cap tokens) rather than guessing.

## Exit check

After your recipe passes the automated checks, explain in one sentence
the single assumption most likely to invalidate it in production.
