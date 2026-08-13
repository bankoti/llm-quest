"""
Level 6 — Causal Self-Attention

Implement one attention head using only numpy.
The math is identical to PyTorch; you are proving you know the equation,
not that you can call a library.

Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k)  +  causal_mask ) V

Your task: fill in the three TODOs below.
"""
import numpy as np
from typing import Tuple

def causal_attention(
    query: np.ndarray,
    key: np.ndarray,
    value: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Args:
        query, key, value: arrays shaped (B, T, D)
    Returns:
        output:  (B, T, D)  — attended values
        weights: (B, T, T)  — attention probabilities (rows sum to 1)
    """
    B, T, D = query.shape

    # TODO 1: compute raw scores = (Q @ K^T) / sqrt(D)
    # scores shape should be (B, T, T)
    scores = ...

    # TODO 2: apply causal mask — positions above the diagonal become -inf
    # (so softmax maps them to 0 probability)
    mask = ...          # (T, T) lower-triangular of ones
    scores = ...        # fill upper triangle with -np.inf

    # TODO 3: softmax over the last axis, then mix values
    # weights = softmax(scores), output = weights @ value
    weights = ...
    output  = ...

    return output, weights
