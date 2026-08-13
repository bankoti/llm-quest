"""Level 8 — RMSNorm & RoPE
Two component swaps in every modern LLM.
"""
import numpy as np

def rms_norm(x: np.ndarray, weight: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """weight * x / sqrt(mean(x**2) + eps)"""
    raise NotImplementedError

def rotate_half(x: np.ndarray) -> np.ndarray:
    """(x0,x1,x2,x3) -> (-x1,x0,-x3,x2). Split last axis in half."""
    raise NotImplementedError
