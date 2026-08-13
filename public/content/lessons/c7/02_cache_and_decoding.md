# 02 - KV Cache, Prefix Reuse, and Decoding Acceleration

For ordinary cached attention:

```text
KV bytes = 2 * layers * cached_tokens * KV_heads * head_dim * bytes_per_scalar
```

Multiply by concurrent sequences, then add allocator metadata, block slack,
temporary activations, weights, runtime workspace, and safety reserve. Long
prompts reduce available concurrency even when request rate is unchanged.

## Cache correctness

Cached and uncached generation should produce matching logits within numerical
tolerance for the same model, mask, positions, and precision. Test one-token
prefill, multi-token prefill, left padding, sliding windows, RoPE offsets, beam or
branch copy-on-write, and cache reset between tenants.

## Prefix caching

Reusable system prompts or documents can share prefill state when token IDs,
model, adapters, position treatment, and all relevant configuration match. Hash
exact tokens plus versions, not raw text alone. Authorization belongs in cache
identity or access checks; cross-tenant reuse cannot expose private prefixes.
Invalidation and hit-quality metrics matter more than nominal hit count.

## Cache quantization and eviction

Lower-precision K/V can increase concurrency but may change quality, especially
over long contexts. Evaluate task and position slices. Eviction or local windows
must preserve the architecture’s semantics; arbitrary truncation is a quality
policy, not transparent optimization.

## Speculative decoding

A cheaper draft model proposes tokens and the target model verifies them, aiming
to reduce target decode iterations while preserving its distribution under the
algorithm’s assumptions. Speedup depends on acceptance rate, draft cost, batch,
and kernels. Measure quality equivalence and tail latency, not only accepted
tokens.

Complete `workbook/03_token_budget.py`. It converts remaining deadline and decode
rate into a bounded output limit; production schedulers also need queue and
prefill estimates.

**Checkpoint:** Calculate maximum concurrent 8K contexts on a fixed memory budget
for MHA and GQA, then reserve 20% for non-cache memory.
