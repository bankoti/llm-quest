"""Debug — Leaky Attention 🐛
An AI assistant wrote this attention head. It runs without errors and the
output "looks reasonable". It has exactly ONE conceptual bug.
Find it and fix it — the hidden tests know the difference.
"""
import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def causal_attention(Q, K, V):
    """One attention head with causal masking. Q, K, V: (T, D)."""
    T, D = Q.shape
    scores = Q @ K.T / np.sqrt(D)
    mask = np.tril(np.ones((T, T), dtype=bool))
    scores = np.where(mask, scores, 0.0)
    weights = softmax(scores)
    return weights @ V
