# 01 - Encoder-Only Models: BERT

The first architecture fork: give up generation, gain full bidirectional
context. BERT-style encoders still carry a large share of production ranking
and extraction traffic, so read this family as a working tool.

![Encoder vs decoder attention](content/images/c3/bert_vs_gpt_mask.svg)


BERT trains a Transformer encoder with access to both left and right context.
Its masked-language-model (MLM) objective reconstructs selected tokens from
their surroundings. For input `x`, only selected positions `M` contribute:

```text
L_MLM = -sum(i in M) log p(x_i | corrupted(x))
```

This differs from next-token prediction in both the visibility mask and the
supervised positions. The representation at each token can combine evidence
from the complete unmasked input.

One sentence shows the difference. In `the [MASK] barked at the mailman`, the
evidence that the answer is `dog` sits to the right of the mask. A causal model
predicting at that position would see only `the`; the encoder sees the whole
sentence and gets the answer almost for free.

Unlike a decoder LM, changing token `t+1` may change the representation at `t`.
That is useful for understanding a complete input and incompatible with direct
left-to-right generation unless another decoding mechanism is added.

The original BERT also used next-sentence prediction. Later encoder recipes vary,
so do not make that auxiliary task a definition of the family. Bidirectional
self-attention plus denoising or representation learning is the durable center.

## The teaching model

Picture a minimal encoder-only model: standard bidirectional encoder layers,
learned positions, and masked-token logits with their loss. BERT-shaped
teaching code, not a checkpoint reproduction.

Trace shapes for `B=2`, `T=16`, `D=64`, and vocabulary `V=512`. The embedding
and every residual stream are `[2,16,64]`; logits are `[2,16,512]`. The loss
flattens to 32 positions but ignores every target marked `-100`.

## One architecture, different systems

Classification, tagging, and extraction can attach heads to token or pooled
representations. A cross-encoder reranker jointly encodes query and document for
high quality but repeats the document computation per query. A dual encoder
produces independent vectors that can be indexed, trading some interaction for
retrieval scale. Both can use an encoder-only backbone while having very
different production latency and storage.

## Failure probes

1. Set all MLM targets to `-100`. A robust training loop should detect an empty
   supervised batch rather than accept a meaningless update.
2. Change a future token and confirm an earlier hidden state can change.
3. Add padding without an attention mask. Any leak is a data-pipeline bug, not
   an encoder property.
4. Compare mean pooling with a designated classification token. Pooling is a
   task-head choice, not part of bidirectional attention.

**Checkpoint:** Explain why a BERT-like encoder can score candidate relevance but
cannot emit an unbounded answer with its MLM head alone.
