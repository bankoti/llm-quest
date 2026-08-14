# 07 - State-Space Models and Hybrids

Attention retrieves from an explicit set of prior token representations. A
state-space layer instead updates a recurrent state:

```text
state_t  = A_t * state_(t-1) + B_t * input_t
output_t = C_t * state_t     + D * input_t
```

Mamba makes state-space parameters input-dependent, giving the model selective
control over what enters, persists in, and leaves state. Training can evaluate a
parallel scan; token-by-token generation retains fixed-size layer state rather
than appending a K/V entry for every prior token.

## The tradeoff is addressability

![SSM fixed state vs attention KV cache](content/images/c3/ssm_vs_attention.svg)


Linear sequence work and fixed recurrent state are attractive, but the state is
a compression of history. Attention can directly score a query against a
particular prior position; a recurrent model must preserve useful information
through every update. “Linear time” is a complexity statement, not a blanket
quality or latency guarantee. Kernel maturity, state width, batch size, and
hardware determine realized speed.

Compare retained inference state:

```text
attention: O(layers * tokens * KV_width)
SSM:       O(layers * state_width)
hybrid:    sum of attention caches and recurrent states
```

The hybrid line matters. Jamba interleaves Transformer attention, Mamba, and MoE
layers. Other hybrids periodically restore global content-addressable access.
These systems show that sequence mixers and channel mixers are composable design
tools, not mutually exclusive categories.

## Inspect the teaching recurrence

`SelectiveStateSpaceLayer` is transparent educational code, not the exact Mamba
selective-scan algorithm or optimized kernel. Run `labs/04_state_space.py` and
verify:

- changing a future input cannot alter an earlier output;
- recurrent state size does not grow with decoded length;
- chunked processing with carried state matches one continuous pass, if the
  implementation exposes equivalent state boundaries;
- resetting state at a chunk boundary changes later outputs.

The final test reveals an operational contract: recurrent state must be routed,
versioned, and invalidated correctly in a serving system just like a KV cache.

**Checkpoint:** Recommend attention, an SSM, or a hybrid for a workload with long
streaming inputs and occasional exact references to early identifiers. Explain
which experiment could overturn your recommendation.
