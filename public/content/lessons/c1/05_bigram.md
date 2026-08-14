# 05 - The bigram baseline

## The smallest trainable language model

![Bigram count matrix](content/images/c1/bigram_counts.svg)


A bigram model predicts the next token using only the current token. With
vocabulary size `V`, it stores a `V x V` table. Row `i` contains the logits for
what follows token `i`.

PyTorch's embedding lookup is exactly the table operation we need:

```python
self.token_embedding = torch.nn.Embedding(vocab_size, vocab_size)
logits = self.token_embedding(inputs)  # (B, T) -> (B, T, V)
```

Although named "embedding," each row here directly has one value per output
token. A Transformer instead embeds into width `C`, computes hidden features, and
projects those features to `V` logits at the end.

## What training produces

Train this model for a few hundred steps on any small corpus and the loss falls
quickly, but generated text has locally plausible character pairs and poor
long-range structure. That is expected evidence of the model's context
limitation, not a bug.

## A count-based version

Before gradient descent, derive the same idea by counting:

```python
counts = torch.ones(V, V)  # add-one smoothing
for current, following in zip(tokens, tokens[1:]):
    counts[current, following] += 1
probabilities = counts / counts.sum(dim=1, keepdim=True)
```

The neural version learns logits by minimizing cross entropy. The count version
directly estimates probabilities from frequency. Their predictions should become
similar with enough data and optimization.

## Why keep this baseline

The bigram model validates the entire outer pipeline:

- tokenizer round trip;
- train/validation split;
- shifted targets;
- cross-entropy calculation;
- optimizer updates;
- checkpoint save/load;
- autoregressive sampling.

If the Transformer fails while the bigram works, you have narrowed the fault to
the more complex architecture or its optimization.

## Experiment

If you train this model yourself, do it at 10, 50, 200, and 1,000 steps. Record
train loss, validation loss, and a fixed-prompt sample. Do not judge quality
from loss alone and do not judge it from one lucky sample.

Then complete the challenge below; get the forward-pass shapes right before
worrying about anything else.

## Exit check

State the bigram parameter count in terms of `V`. Explain why it cannot tell the
difference between `New York is` and `The weather is` when predicting after `is`.
