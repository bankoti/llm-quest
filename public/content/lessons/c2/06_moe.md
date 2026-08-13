# 06 - Sparse Mixture of Experts

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

## Invariants

- Each token selects exactly `k` expert indices.
- Selected weights are renormalized to sum to one.
- Gradients reach the router and selected experts.
- A useful report includes both total and active parameter counts.

## Practice

Complete `workbook/03_sparse_moe.py`, then force the router toward one expert and
observe the balance loss.

## Exit check

Why can two models with the same total parameter count have very different
inference cost per token?
