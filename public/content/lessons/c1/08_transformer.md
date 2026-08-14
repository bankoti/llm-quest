# 08 - Assemble a decoder-only Transformer

## The data flow

```text
token IDs (B,T)
  -> token embeddings + position embeddings (B,T,C)
  -> N x [pre-norm -> attention -> residual -> pre-norm -> MLP -> residual]
  -> final layer norm (B,T,C)
  -> language-model head (B,T,V)
```

This is a GPT-style **decoder-only** Transformer: it uses causal self-attention and
predicts the next token. The original Transformer also had an encoder and
cross-attention for sequence-to-sequence tasks.

## Embeddings

Token embeddings learn a vector per vocabulary item. Learned position embeddings
provide one vector per context position. They are added because both have shape
`(B, T, C)` after broadcasting.

The course ties token-embedding and output-head weights. The same matrix maps
token IDs into feature space and maps final features back to token logits. This
reduces parameters and often improves language models.

## Residual stream

![Transformer block stack](content/images/c1/transformer_stack.svg)


Each sublayer adds a learned change to the running representation:

```python
x = x + attention(layer_norm(x))
x = x + feed_forward(layer_norm(x))
```

The residual stream is the model's main information highway. Sublayers read from
it and write updates back to it.

## Pre-normalization

Layer normalization computes statistics across the channel axis of each token.
This implementation normalizes before attention and before the MLP. Pre-norm
Transformers generally optimize more reliably at depth than the original
post-norm arrangement.

## Feed-forward network

Attention communicates across positions. The MLP computes independently at each
position:

```text
C -> 4C -> GELU -> C
```

The wider hidden layer provides capacity for nonlinear feature transformations.
Modern models often replace this GELU MLP with gated variants such as SwiGLU.

## Parameter accounting

For one approximate block, ignoring biases and norms:

```text
QKV projection: 3 C^2
output projection: C^2
MLP up/down: 8 C^2
total: about 12 C^2 parameters per block
```

Embeddings add roughly `V*C + T*C`; weight tying avoids another `V*C` output
matrix. Parameter count measures storage, not total training compute.

## Assemble in this order

1. causal self-attention (previous level)
2. the position-wise feed-forward network
3. one block: `x = x + attn(norm(x))`, then `x = x + ffn(norm(x))`
4. the forward pass: embeddings, blocks, final norm, logits
5. generation: crop context, forward, sample, append, repeat

At every operation, annotate the output shape. Stop when you cannot justify one.

## Build it yourself

Complete the challenge below. Start with
one layer, one head, width 32, and dropout zero. Get the forward shape and causal
test passing before adding depth or dropout.

## Exit check

Explain why position information is necessary, why attention and the MLP perform
different jobs, and why residual connections make deep stacks trainable.
