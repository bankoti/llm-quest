# 11 - Config and Checkpoint Forensics

Model inspection starts with machine-readable artifacts, not a diagram. Download
only the config and tokenizer metadata when weights are too large. Record the
repository, checkpoint identifier, revision hash, license, and library version
that interprets the config.

## Pass 1: establish dimensions

![Four-pass config forensics](content/images/c3/config_forensics.svg)


Extract vocabulary size, width, layer count, attention heads, KV heads, head
dimension, intermediate width, expert count and top `k`, context fields, position
parameters, normalization epsilon, and tying. Check invariants:

```text
query projection width = num_heads * head_dim
KV projection width    = num_kv_heads * head_dim
num_heads % num_kv_heads == 0        # for ordinary GQA grouping
top_k <= num_experts
```

Do not assume `head_dim = hidden_size / num_heads`; some configurations set an
explicit head dimension. Do not assume all layers share one attention topology.

The challenge below validates a compact model-like config and derives GQA
grouping, attention projection parameters, and KV bytes. Invent one invalid
fixture for every invariant.

## Pass 2: follow construction

Find the model class selected by the config. Trace one layer from constructor to
forward method. Note conditionals based on layer index, model size, cache type,
or backend. Follow generation code far enough to identify cache layout and
position updates. Search for tensor reshapes around kernels; physical layout can
differ from conceptual `[batch, heads, time, head_dim]`.

## Pass 3: reconcile weights

Checkpoint manifests often list shard sizes, not tensor semantics. If tensor
indexes are available, group names by embeddings, attention, MLP or experts,
norms, and output head. Reconcile estimated scalar count. Quantized file bytes
are not equal to parameter count because scales, zero points, metadata, and mixed
precision add overhead.

## Pass 4: probe behavior

Use the smallest loadable checkpoint or a miniature configured with the same
ratios. Test causality, cache/no-cache equivalence, left/right padding behavior,
maximum accepted length, and deterministic generation in evaluation mode. A
miniature validates your interpretation, not the large checkpoint’s quality.

## Evidence log

Store each finding as `claim -> artifact -> location -> derivation/test ->
confidence`. Mark undocumented inference where source behavior supplies the only
evidence. Config keys can be accepted but ignored, so follow values into code.

**Checkpoint:** Audit a config twice: once from prose only and once from source.
List every assumption the second pass corrected.
