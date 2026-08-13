"""Level 3 — Data & Batching
Sample shifted context-target windows. No torch needed.
"""
import numpy as np
from typing import Tuple

def get_batch(
    tokens: np.ndarray,
    batch_size: int,
    block_size: int,
    rng: np.random.Generator,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Sample batch_size random windows of length block_size.
    Returns inputs (B, T) and targets (B, T) = inputs shifted right by 1.
    """
    raise NotImplementedError
