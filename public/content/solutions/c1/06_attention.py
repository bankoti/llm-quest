import numpy as np

def causal_attention(query, key, value):
    scores = query @ key.swapaxes(-1, -2) / np.sqrt(query.shape[-1])
    t = query.shape[1]
    scores = np.where(np.tri(t, dtype=bool), scores, -np.inf)
    weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
    weights /= weights.sum(axis=-1, keepdims=True)
    return weights @ value, weights
