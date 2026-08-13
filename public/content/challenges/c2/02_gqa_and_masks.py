"""Level 9 — GQA & Sliding Window Masks
"""
import numpy as np
from typing import Optional

def repeat_kv(kv: np.ndarray, repeats: int) -> np.ndarray:
    """kv: (B,kv_heads,T,D) -> (B,kv_heads*repeats,T,D). Repeat each head consecutively."""
    raise NotImplementedError

def causal_mask(length: int, window: Optional[int] = None) -> np.ndarray:
    """Bool mask (length,length). True=allowed. window=None: full causal."""
    raise NotImplementedError
