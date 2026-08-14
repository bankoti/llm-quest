# 07 - State-Space Models and Hybrids

Attention keeps everything and looks back; a state-space model keeps a
fixed-size summary and moves on. That single design difference drives every
tradeoff in this level.

Attention retrieves from an explicit set of prior token representations. A
state-space layer instead updates a recurrent state:

```text
state_t  = A_t * state_(t-1) + B_t * input_t
output_t = C_t * state_t     + D * input_t
```

Trace it with scalars. Let A = 0.5, B = 1, C = 2, D = 0, and inputs `[3, 1]`:

```text
t=1: state = 0.5*0 + 3 = 3      output = 6
t=2: state = 0.5*3 + 1 = 2.5    output = 5
```

The state after step 2 is one number, and it would still be one number after a
million steps. Input 1's influence survives only as the `0.5*3` term folded
into that number; nothing lets step 900,000 ask specifically about step 1 the
way a query can address a key.

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

The recurrence in the challenge below is transparent educational code, not the
exact Mamba selective-scan algorithm or optimized kernel. Verify:

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
