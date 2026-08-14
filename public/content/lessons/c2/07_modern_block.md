# 07 - Assemble the Modern Decoder

![Modern decoder block](content/images/c2/modern_block.svg)


The course reference block is pre-norm:

```text
x = x + GQA(RMSNorm(x))
x = x + SwiGLU_or_MoE(RMSNorm(x))
```

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

## Debugging order

1. Assert every tensor shape.
2. Prove causality by perturbing a future token.
3. Overfit one tiny batch.
4. Enable GQA, local attention, or MoE one change at a time.
5. Compare parameter count, loss, and tokens per second.

## Practice

Complete the challenge below and compare the dense and MoE variants.
