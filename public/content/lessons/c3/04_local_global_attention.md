# 04 - Local, Global, and Layerwise Attention

Dense causal attention lets every position attend to every earlier position. At
training time the score matrix grows quadratically in sequence length; during
cached decoding, retained K/V state grows linearly. Attention topology changes
which edges exist before kernels decide how efficiently to compute them.

A sliding-window layer with window `w` allows query position `t` to read roughly
`[t-w+1, t]`. One layer cannot directly access older tokens. Across `L` layers,
information can propagate farther through intermediate states, but this is not
equivalent to direct content-addressable access over the full prefix.

Mistral 7B combines grouped-query attention with sliding-window attention. Gemma
2 alternates local and global layers. Local layers reduce score work; global
layers restore direct access across the available context. Other families use
block patterns or learned selection. “Long context” therefore does not identify
one topology.

## Reachability is not recall

If every layer has window `w`, a rough upper bound on backward graph reach after
`L` layers is `1 + L(w-1)`. Residuals and nonlinear content affect what survives,
and training determines whether the model learns to relay it. A graph path is
necessary for influence but not proof of useful retrieval.

Ask four separate questions:

1. What context length did training or continued training expose?
2. Which token pairs can directly attend in each layer?
3. What RoPE or position treatment applies outside the original range?
4. Does the cache implementation actually evict state for local layers?

A local mask alone may reduce score computation while a generic runtime still
stores all prior keys and values. Inspect cache code and profile memory.

## Lab

Run `labs/02_attention_topology.py`. Calculate reachability for stacked local
layers and a local/global mix. Add a pattern where every fourth layer is global.
For sequence length 8,192 and window 4,096, report both theoretical attention
edges and retained cache under full-retention versus window-aware serving.

**Checkpoint:** Design a position-pair probe that distinguishes accepted context
length, graph reachability, and actual retrieval quality. State what each result
can and cannot prove.
