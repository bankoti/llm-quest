"""Debug — Backwards Ranking 🐛
An AI assistant wrote the retrieval core. Users report the results are
"weirdly, consistently terrible". Not randomly bad — consistently. ONE bug.
"""
import numpy as np
from typing import List

def top_k_indices(scores: np.ndarray, k: int) -> List[int]:
    """Indices of the k highest-scoring documents, best first."""
    return np.argsort(scores)[:k].tolist()
