"""Debug — The Norm That Centers 🐛
An AI assistant "ported RMSNorm from the Llama paper". It runs, outputs are
normalised, downstream code is happy. ONE conceptual bug.
"""
import numpy as np

def rms_norm(x, weight, eps=1e-6):
    """RMSNorm as used in Llama-family models. x: (..., C), weight: (C,)."""
    mu = x.mean(axis=-1, keepdims=True)
    centered = x - mu
    return weight * centered / np.sqrt((centered**2).mean(axis=-1, keepdims=True) + eps)
