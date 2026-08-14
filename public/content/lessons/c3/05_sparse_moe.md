# 05 - Sparse Mixture-of-Experts Families

A sparse mixture-of-experts (MoE) layer replaces one dense feed-forward network
with a router and several expert networks. For token state `x`, a top-`k` router
selects a small expert subset:

```text
p = softmax(router(x))
y = sum(i in top_k(p)) normalized_p_i * expert_i(x)
```

If each SwiGLU expert has about `3DF` weights, `E` experts provide roughly
`E * 3DF` total FFN capacity while only `k * 3DF` expert weights are active per
token. Router, attention, embeddings, shared experts, and normalization remain
active, so “active parameters” is not simply total parameters times `k/E`.

Mixtral routes each token to two of eight feed-forward experts. OLMoE provides an
open view of MoE training and token-choice routing. DeepSeek-V3 combines routed
and shared experts and describes auxiliary-loss-free load balancing. These are
not interchangeable implementations merely because all use the MoE label.

## The systems cost

![MoE routing across devices](content/images/c3/moe_systems_cost.svg)


Sparse arithmetic does not guarantee low latency. In expert parallel execution,
tokens must be grouped by destination, exchanged across devices, processed, and
returned. Skewed routing creates stragglers; small per-expert batches waste
hardware; capacity limits may drop or reroute tokens. Training needs a strategy
for balanced specialization without forcing every token uniformly everywhere.

For any sparse model, inspect:

- expert count, top `k`, and any shared experts;
- token-choice versus expert-choice routing;
- capacity factors and dropped-token behavior;
- router precision, noise, normalization, and balancing losses;
- expert parallel groups and all-to-all communication;
- total weights, active weights, and memory placement;
- inference batching assumptions.

## Lab and failure analysis

In the challenge below, extend the parameter report to include shared
experts and attention weights. Then simulate 1,000 tokens all routed to one
expert. The arithmetic count is unchanged, but utilization and latency are not.

Router collapse, unstable expert assignment, and undertrained experts are model
quality failures. Communication saturation and insufficient tokens per expert
are systems failures. A complete evaluation needs both.

**Checkpoint:** Given `E=64`, `k=2`, one shared expert, and eight devices, produce
separate estimates for total capacity, active FFN weights per token, and the
minimum expert weights each device must hold under simple expert parallelism.
