# 08 - Memory-Budget Serving

A 2.78-trillion-parameter model runs correctly on a laptop with 8 GB of RAM.
More memory makes it faster; it does not change the answer. That fact is not
a trick — it follows from treating memory as a dial you set per deployment,
not a fixed requirement.

## The memory stack

Every LLM inference job competes for the same pool of device memory across
four categories:

```text
total ≥ weights + kv_cache + activations + overhead
```

Weights are the dominant term at startup. KV cache grows with context and
batch size. Activations are transient and proportional to the largest layer.
Overhead covers CUDA context, kernels, fragmentation.

For planning, weights and KV cache are the two numbers you control. A serving
system that does not model both will either OOM under load or leave throughput
on the table.

## Weights: quantization as a dial

Model weights are stored at training precision (BF16, 2 bytes/param) or
reduced for inference:

| Format | Bytes per param | 7B model | 70B model |
| --- | --- | --- | --- |
| BF16 | 2.0 | 14 GB | 140 GB |
| INT8 | 1.0 | 7 GB | 70 GB |
| INT4 | 0.5 | 3.5 GB | 35 GB |

INT8 weight-only quantization typically costs 0–1% quality on common
benchmarks and is a safe default for most tasks. INT4 can cost 1–3% and is
worth measuring before deploying on quality-sensitive paths.

> **Tip:** quantize weights and KV cache independently. Weight quantization
> affects model quality directly. KV cache quantization affects only the
> similarity of reconstructed attention keys and values; the tradeoff is
> often more forgiving and the savings are proportionally larger under long
> contexts.

## KV cache: the context-length multiplier

For each decode step, the KV cache holds every past position's keys and values:

```text
kv_bytes = 2 * layers * kv_heads * head_dim * seq_len * batch_size * bytes_per_kv
```

The `2` is for K and V. `bytes_per_kv` defaults to 2 (BF16); quantizing KV
to INT8 halves it.

At a 32K-token context, batch 8, with 32 layers, 8 KV heads, head_dim 128,
BF16:

```text
2 x 32 x 8 x 128 x 32768 x 8 x 2 bytes = 68 GB
```

That is roughly five times the weight footprint of a 7B model. Context length
is the dominant variable once you pass a few thousand tokens.

## The memory ladder

kimi-k3-in-c encodes this as a principle with measured data: the same
2.78T-parameter model runs in 8 GB (streaming from NVMe), 32 GB, 64 GB, and
128 GB+. Output is byte-identical at every level because no computation
changes; only the ratio of cache-resident to disk-resident weights changes.
The practical consequence for serving is:

- **Floor**: what is the minimum memory to serve any request at all? Determined
  by the active compute graph for one forward pass (resident trunk + activations).
- **Throughput threshold**: what memory gives acceptable tokens/sec? The point
  where hot layers and the KV cache for typical batch sizes fit.
- **Full resident**: where does latency stop improving? When the entire model
  and max-batch KV fit in memory.

Provisioning between floor and throughput threshold is waste. Provisioning
beyond full resident is also waste. The dial has two meaningful points and
a productive range between them.

> **Gotcha:** GPU memory and CPU RAM are not interchangeable for latency.
> Weights offloaded to CPU cost a PCIe round trip on every layer. NVMe is
> another order of magnitude slower. Plan for the latency constraint first,
> then the memory constraint. An INT4 model on GPU beats a BF16 model on CPU
> for any latency-sensitive workload.

## Maximum batch size

Given a memory budget, subtract the weight footprint and the per-token KV
overhead, and the remainder determines batch:

```text
budget_after_weights = memory_budget - weight_bytes
bytes_per_sequence   = 2 * layers * kv_heads * head_dim * seq_len * bytes_per_kv
max_batch            = floor(budget_after_weights / bytes_per_sequence)
```

If `max_batch` is 1 or 0 at target context length, the model does not fit for
that configuration at BF16. Quantize weights, reduce context, or move to a
larger device.

## Choosing a quantization level

A simple decision rule:

1. If `model_bytes(params, bf16)` fits in the budget → use BF16.
2. Else if `model_bytes(params, int8)` fits → use INT8.
3. Else if `model_bytes(params, int4)` fits → use INT4.
4. Else the model does not fit and requires a different approach
   (tensor parallelism, CPU offload, or a smaller model).

This is not the only valid rule. The right answer depends on quality
requirements and available measurement data. The rule above is a starting
point that avoids the most common over- and under-provisioning mistakes.

## Your challenge

Implement the four serving primitives: model weight bytes, KV cache bytes,
max batch size given a budget, and quantization recommendation. Then use them
to compare two deployment scenarios from the kimi-k3-in-c memory ladder.
