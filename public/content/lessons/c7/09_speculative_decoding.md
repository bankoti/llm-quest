# 09 - Speculative Decoding

A 70B model generates a token every 30 ms, and most of those tokens are easy:
"the", closing brackets, the obvious next word of a sentence it has already
committed to. You are paying frontier-model latency for autocomplete work.
Speculative decoding routes the easy tokens to a cheap model and keeps the
target model's output distribution exactly intact.

## Draft, then verify

The loop has two players:

1. A **draft model** (small, fast) proposes the next `gamma` tokens
   autoregressively.
2. The **target model** (large, the one you actually serve) runs a single
   forward pass over all `gamma` positions at once and verifies them.

Verification is the trick. A forward pass over `gamma` known tokens is one
parallel pass, not `gamma` sequential ones; it costs about the same as
generating a single token. If the draft guessed well, you just got several
tokens for the price of one.

## Exactness comes from rejection sampling

For each drafted token, compare the probability each model assigned to it:
`p` from the target, `q` from the draft. Accept the token with probability

```text
accept = min(1, p / q)
```

On the first rejection, sample a replacement token from a corrected target
distribution and discard the rest of the draft. If all `gamma` survive, the
target emits one bonus token from its own next-position logits. Leviathan et
al. 2022 (arXiv:2211.17192) prove this procedure samples from exactly the
target model's distribution. Not approximately: bit-exact in expectation.
You cannot lose quality, only time.

> **Note:** this is why speculative decoding became the default serving
> lever by 2026 while quantization stayed a per-deployment judgment call.
> Quantization trades quality for memory; speculation trades nothing, it
> just needs a draft model that guesses well.

## The arithmetic of speedup

Let `alpha` be the per-token acceptance rate and treat acceptances as
independent. Expected tokens per verify step (Leviathan Eq. 1):

```text
E[tokens] = (1 - alpha^(gamma+1)) / (1 - alpha)
```

Each verify step costs `gamma` draft tokens plus one target pass. With a
draft that costs `c` relative to the target (c = 0.1 means 10x cheaper):

```text
speedup = E[tokens] / (c * gamma + 1)
```

Two worked points, alpha = 0.8, c = 0.1:

```text
gamma = 4:  E = (1 - 0.8^5) / 0.2 = 3.36 tokens  ->  3.36 / 1.4 = 2.40x
gamma = 6:  E = (1 - 0.8^7) / 0.2 = 3.95 tokens  ->  3.95 / 1.6 = 2.47x
```

The curve peaks: longer drafts add cost linearly but the chance of surviving
all of them decays geometrically. For alpha = 0.8, c = 0.1 the optimum is
gamma = 6; past it, speedup falls. And if alpha is low or the draft is
expensive, the optimum collapses to gamma = 1 or speculation loses outright.
A drafted token that gets rejected is pure wasted work, which is why
`speedup(4, alpha=0, c=0.1) < 1`.

> **Gotcha:** alpha is not a property of the draft model alone; it is a
> property of the pair and the workload. Code and boilerplate-heavy text
> accept at 0.85+; creative prose accepts much lower. Measure alpha on your
> real traffic before committing to a gamma.

## Where the field took it

The 2026 production stacks (vLLM and friends) rarely use a separate draft
model anymore. EAGLE-3 and Medusa attach lightweight prediction heads to the
target model itself, and Nemotron 3 ships multi-token-prediction heads
trained for exactly this purpose, pushing 2 to 3x throughput on identical
hardware with bit-exact output. The math you implement here is unchanged;
only the source of the draft got cheaper.

> **Note:** speculation attacks latency per token. The other big serving
> lever, PagedAttention with continuous batching, attacks throughput by
> packing more sequences into memory (you built the memory side of that
> argument in the previous level). Production serving uses both; they
> compose because they optimize different axes.

## Your challenge

Implement the five primitives: the acceptance rule, a verify-step walk over
one draft, expected tokens per step, the speedup formula, and the optimal
draft length search.
