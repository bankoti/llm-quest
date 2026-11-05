"""Complete small GPT forward pass. NumPy; no autograd in the browser."""
import numpy as np


def _norm(x):
    if not np.isfinite(x).all():
        raise FloatingPointError('Nonfinite decoder residual')
    with np.errstate(over='ignore', invalid='ignore'):
        scale = np.maximum(np.max(np.abs(x), axis=-1, keepdims=True), np.sqrt(1e-5))
        scaled = x / scale
        centered = scaled - scaled.mean(axis=-1, keepdims=True)
        denominator = np.hypot(np.sqrt(np.mean(centered**2, axis=-1, keepdims=True)), np.sqrt(1e-5)/scale)
        normalized = np.divide(centered, denominator, out=np.zeros_like(centered), where=denominator != 0)
    if not np.isfinite(normalized).all():
        raise FloatingPointError('Decoder normalization exceeds float64 range')
    return normalized


def decoder_logits(ids, embedding, positions, blocks, heads):
    """Return [B,T,V] logits for a tied-output, pre-norm causal decoder.

    ids integer [B,T], embedding [V,D], positions [max_T,D], T<=max_T.
    D divisible by positive heads. blocks is a list of dictionaries:
    q,k,v,o: [D,D]; up: [D,F]; down: [F,D]. No biases or learned norm affine.
    Each block: residual attention(norm(x)); then residual MLP(norm(x)).
    MLP uses GELU approximation h/(1+exp(-1.702*h)). Final norm, then @E.T.
    Assume valid finite shapes/IDs. Do not modify any inputs or parameters.
    Compute numeric parameters in floating point; IDs remain integers.
    Negative infinite MLP preactivations from overflow use the activation
    limit zero. Raise FloatingPointError for nonrepresentable attention
    intermediates, NaN preactivations, nonfinite active activations, residuals,
    or output logits. Row normalization scales before measuring variance.
    """
    embedding, positions = np.asarray(embedding, float), np.asarray(positions, float)
    batch, length = ids.shape
    width = embedding.shape[1]
    head_width = width // heads
    with np.errstate(over='ignore', invalid='ignore'):
        x = embedding[ids] + positions[:length]
        for block in blocks:
            n = _norm(x)
            q, k, v = [(n @ block[name]).reshape(batch, length, heads, head_width).transpose(0, 2, 1, 3) for name in ('q', 'k', 'v')]
            if not all(np.isfinite(value).all() for value in (q, k, v)):
                raise FloatingPointError('Decoder attention projection exceeds float64 range')
            scores = (q @ k.swapaxes(-1, -2)) / np.sqrt(head_width)
            causal = np.tril(np.ones((length, length), bool))
            if not np.isfinite(scores[..., causal]).all():
                raise FloatingPointError('Decoder attention scores exceed float64 range')
            scores = np.where(causal, scores, -np.inf)
            weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
            weights /= weights.sum(axis=-1, keepdims=True)
            context = (weights @ v).transpose(0, 2, 1, 3).reshape(batch, length, width)
            x = x + context @ block['o']
            h = _norm(x) @ block['up']
            if np.isnan(h).any():
                raise FloatingPointError('Indeterminate decoder preactivation')
            # Stable sigmoid avoids overflow while preserving the Course 1 approximation.
            sigmoid = np.exp(-np.logaddexp(0., -1.702 * h))
            activation = np.zeros_like(h)
            np.multiply(h, sigmoid, out=activation, where=sigmoid != 0)
            if not np.isfinite(activation).all():
                raise FloatingPointError('Decoder activation exceeds float64 range')
            x = x + activation @ block['down']
        logits = _norm(x) @ embedding.T
    if not np.isfinite(logits).all():
        raise FloatingPointError('Decoder logits exceed float64 range')
    return logits
