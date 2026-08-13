"""Level 4 — The Bigram Baseline
Simplest trainable LM: one embedding lookup, cross-entropy loss.
"""
import numpy as np
from typing import Optional, Tuple

def softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def cross_entropy(logits: np.ndarray, targets: np.ndarray) -> float:
    """Mean cross-entropy. logits: (N, V), targets: (N,) ints."""
    # TODO: softmax -> log -> index by targets -> negate -> mean
    raise NotImplementedError

def bigram_forward(
    inputs: np.ndarray,
    embedding: np.ndarray,
    targets: Optional[np.ndarray] = None,
) -> Tuple[np.ndarray, Optional[float]]:
    """Returns (logits (B,T,V), loss or None)."""
    raise NotImplementedError
