# 06 - Training Recipe Defense

## What this level tests

The five prior levels gave you tools: scaling laws, data arithmetic, DPO
loss, GRPO advantages, and config forensics. This level asks you to use them
together under real constraints.

## The scenario

Your organization can afford 2e23 FLOPs of training compute. Serve the
resulting model on a single A100. You must produce a recipe that passes
five automated checks:

1. Compute budget: `6 * N * D <= 2e23`
2. Inference latency: model fits in 40GB GPU memory at bfloat16
3. KV cache: 64 concurrent 2K-token contexts fit in remaining memory
4. SFT coverage: token count implies post-training is feasible
5. Alignment: DPO beta is in (0, 1] and chosen/rejected log-prob gap is positive

## What the challenge checks

The grader instantiates your `TrainingRecipe` dataclass and calls
`recipe.validate()`, which returns a `RecipeReport` with one field per
constraint. Each failed constraint is reported with the actual and expected
values.

Your task: fill in the dataclass fields to produce a passing report.
The numbers must be internally consistent -- you cannot set N and D
independently without also setting a valid compute budget.

## Exit check

After your recipe passes the automated checks, explain in one sentence
the single assumption most likely to invalidate it in production.
