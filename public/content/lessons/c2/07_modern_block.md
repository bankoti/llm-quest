# 07 - Assemble the Modern Decoder

One config object away from Llama: this level snaps the previous components
together and turns each architecture choice into a flag you can flip and
measure.

![Modern decoder block](content/images/c2/modern_block.svg)


The course reference block is pre-norm:

```text
x = x + GQA(RMSNorm(x))
x = x + SwiGLU_or_MoE(RMSNorm(x))
```

**SwiGLU** replaces the two-layer `W1 + GELU + W2` MLP with three projections
and a multiplicative gate:

```text
SwiGLU(x) = ( silu(x @ W_gate) * (x @ W_up) ) @ W_down
silu(z)   = z * sigmoid(z)          # smooth, never exactly zero
```

The gate (`W_gate`) and content (`W_up`) paths are multiplied element-wise
before the final projection. This gating mechanism is why SwiGLU typically
uses a smaller `hidden_width` (≈ 8/3 × C, vs 4 × C for a plain MLP) at the
same parameter budget.

RoPE is applied to queries and keys inside attention. The residual stream itself
does not receive an added position vector. This separation makes each design
choice independently testable.

`ModernDecoderConfig` exposes the main axes:

```text
query_heads / key_value_heads  -> MHA, GQA, or MQA
window_size                    -> global or local causal attention
num_experts / experts_per_token -> dense FFN or sparse MoE
rope_base                      -> rotary frequency schedule
```

The model is deliberately small and readable. It does not implement fused
kernels, paged KV caches, tensor parallelism, checkpoint conversion, or every
numerical detail of a released checkpoint.

## Predict before you flip

Before toggling a flag, write down what should change. Moving from a dense FFN
to 8 experts with k = 2, for example:

```text
total FFN parameters:          about 8x
active FFN compute per token:  about 2x
attention parameters:          unchanged
```

If a flip changes something you did not predict (parameter count, loss scale,
tokens per second), stop and explain it before moving on. Predicting the delta
is the skill this level trains.

## Debugging order

1. Assert every tensor shape.
2. Prove causality by perturbing a future token.
3. Overfit one tiny batch.
4. Enable GQA, local attention, or MoE one change at a time.
5. Compare parameter count, loss, and tokens per second.

## Practice

Complete the challenge below and compare the dense and MoE variants.
