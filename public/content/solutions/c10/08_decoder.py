"""Complete small GPT forward pass. NumPy; no autograd in the browser."""
import numpy as np


def _norm(x):
    return (x - x.mean(axis=-1, keepdims=True)) / np.sqrt(x.var(axis=-1, keepdims=True) + 1e-5)


def decoder_logits(ids, embedding, positions, blocks, heads):
    """Return [B,T,V] logits for a tied-output, pre-norm causal decoder.

    ids integer [B,T], embedding [V,D], positions [max_T,D], T<=max_T.
    D divisible by positive heads. blocks is a list of dictionaries:
    q,k,v,o: [D,D]; up: [D,F]; down: [F,D]. No biases or learned norm affine.
    Each block: residual attention(norm(x)); then residual MLP(norm(x)).
    MLP uses GELU approximation h/(1+exp(-1.702*h)). Final norm, then @E.T.
    Assume valid finite shapes/IDs. Do not modify any inputs or parameters.
    """
    batch, length = ids.shape
    width = embedding.shape[1]
    head_width = width // heads
    x = embedding[ids] + positions[:length]
    for block in blocks:
        n = _norm(x)
        q, k, v = [(n @ block[name]).reshape(batch, length, heads, head_width).transpose(0, 2, 1, 3) for name in ('q', 'k', 'v')]
        scores = (q @ k.swapaxes(-1, -2)) / np.sqrt(head_width)
        scores = np.where(np.tril(np.ones((length, length), bool)), scores, -np.inf)
        weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
        weights /= weights.sum(axis=-1, keepdims=True)
        context = (weights @ v).transpose(0, 2, 1, 3).reshape(batch, length, width)
        x = x + context @ block['o']
        h = _norm(x) @ block['up']
        # Stable sigmoid avoids overflow while preserving the Course 1 approximation.
        sigmoid = np.exp(-np.logaddexp(0., -1.702 * h))
        x = x + (h * sigmoid) @ block['down']
    return _norm(x) @ embedding.T
