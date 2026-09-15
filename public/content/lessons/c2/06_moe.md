# 06 - Sparse Mixture of Experts

A sparse MoE lets a model store far more parameters than any single token pays
for. The router is twenty lines of code; its consequences reach into every
serving decision downstream.

![Sparse MoE routing](content/images/c2/moe_router.svg)


A sparse MoE replaces one feed-forward network with a router and `E` experts.
For each token, the router computes probabilities and selects only `k` experts:

```text
p = softmax(W_router x)
w_i = p_i / sum(p_j for j in top_k(p))
y = sum(w_i * Expert_i(x)) for i in top_k(p)
```

Total parameter capacity grows with `E`, while active feed-forward compute grows
mostly with `k`. This is conditional computation, not free computation: routing,
communication, expert imbalance, memory, and capacity limits matter.

The first function uses token-choice top-k output mixing. The second implements
Switch-style execution and a balancing objective that discourages concentrated
probability on overloaded experts. Real systems differ in routing rules,
overflow handling, shared experts, and whether they drop tokens.

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

## Top-k mixing invariants

- Each token selects exactly `k` expert indices.
- Selected weights are renormalized to sum to one.
- With multiple selected experts, normalized gates provide a task-gradient path
  to the router; a normalized top-1 gate is constant, as explained below.
- A useful report includes both total and active parameter counts.

## Practice

Complete the challenge below, then force the router toward one expert and
observe the balance loss.

## Exit check

Why can two models with the same total parameter count have very different
inference cost per token?

## From output mixing to Switch execution

The first function, `route`, combines precomputed top-k outputs using normalized
selected weights. It teaches indexing. It cannot demonstrate compute savings:
those outputs have already been calculated. The second function,
`switch_forward`, must call only the experts that receive accepted inputs.

Switch uses top-1 token-choice routing. Compute softmax across all E experts and
select the largest probability. For probabilities `[0.7,0.2,0.1]`, expert 0's
output is multiplied by **0.7**, not by 1. If you normalize a singleton selection
back to 1, you remove the task gradient through that gate. Argmax itself is
discrete; the probability multiplier provides a differentiable path.

### Capacity and overflow

Our lab uses `capacity = ceil(capacity_factor * T/E)` per expert. The paper's
implementation has additional batching and layout details; this CPU exercise
uses one token group and deterministic input-order acceptance.

With T=8, E=4, factor=1, capacity is 2. Assignments `[0,0,0,0,0,1,2,3]`
overflow three tokens at expert 0. Their FFN contributions are zero. In a full
block, the residual `x + FFN(x)` preserves their input; we are not deleting
tokens from the sequence. Larger capacity costs buffers and does not fix an
expert receiving no training examples.

### A learning signal for the router

```text
f_i = number of tokens assigned to expert i / T   # before capacity dropping
P_i = mean probability of expert i across tokens
L_aux = E * sum_i(f_i * P_i)
training_loss = task_loss + coefficient * L_aux
```

At uniform assignments and probabilities, the unscaled auxiliary value is 1,
not zero. Hard assignment fractions are treated as fixed for differentiation;
P retains gradients. Do not assert that every minibatch must attain 1: the
objective is a balancing incentive, not an exact constraint. Inspect actual
loads and dropped tokens alongside it.

### Implement and falsify

1. Compute stable probabilities; use first-index argmax on ties.
2. Gather each expert's accepted input rows and call that expert once.
3. Scatter its gated outputs back into the original token positions.
4. Return outputs, a boolean acceptance mask, and the unscaled auxiliary value.
5. Check empty experts were never called and overflow inputs never ran.

The grader uses instrumented expert functions and checks nonuniform gate values.
The notebook adds autograd: compare a retained gate to the incorrect constant
gate, then train a small router with and without an auxiliary coefficient.
The expected observation is a difference in gradients and assignment behavior,
not a guaranteed quality improvement from any particular coefficient.

**Explain before moving on:** Why does lower active parameter count not guarantee
lower latency? Include dispatch, all-to-all traffic, tiny expert batches, and
load imbalance. The lab has no expert-parallel network and does not reproduce
the paper's training speedups.

Primary source: [Fedus et al., Switch Transformers, sections 2.1-2.4](https://arxiv.org/abs/2101.03961).
