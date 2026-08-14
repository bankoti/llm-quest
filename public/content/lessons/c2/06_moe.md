# 06 - Sparse Mixture of Experts

A sparse MoE lets a model store far more parameters than any single token pays
for. The router is twenty lines of code; its consequences reach into every
serving decision downstream.

![Sparse MoE routing](content/images/c2/moe_router.svg)


A sparse MoE replaces one feed-forward network with a router and `E` experts.
For each token, the router computes probabilities and selects only `k` experts:

```text
p = softmax(W_router x)
y = sum(p_i * Expert_i(x)) for i in top_k(p)
```

Total parameter capacity grows with `E`, while active feed-forward compute grows
mostly with `k`. This is conditional computation, not free computation: routing,
communication, expert imbalance, memory, and capacity limits matter.

The implementation in `components.py` uses token-choice top-k routing. Its
balance loss encourages average router probability and actual assignment share
to agree. Real systems differ in routing rules, overflow handling, shared
experts, and whether they drop tokens.

## Route one token by hand

Four experts, k = 2, router logits `[2.0, 1.0, 0.5, -1.0]`:

```text
softmax     -> [0.61, 0.22, 0.14, 0.03]
top-2       -> experts 0 and 1
renormalize -> [0.73, 0.27]
y = 0.73 * Expert0(x) + 0.27 * Expert1(x)
```

Experts 2 and 3 do no work for this token and receive no gradient from it.
Multiply that by millions of tokens and load balance across experts becomes a
training-stability problem, which is why the balance loss exists.

## Invariants

- Each token selects exactly `k` expert indices.
- Selected weights are renormalized to sum to one.
- Gradients reach the router and selected experts.
- A useful report includes both total and active parameter counts.

## Practice

Complete the challenge below, then force the router toward one expert and
observe the balance loss.

## Exit check

Why can two models with the same total parameter count have very different
inference cost per token?
