"""IO-aware attention: memory accounting, then exact tiled causal attention.

Implement the recurrence in the lesson. This NumPy reference teaches the
algorithm; it is not a fused GPU kernel and has no speedup guarantee.
"""
import numpy as np
def score_matrix_bytes(batch:int, heads:int, tokens:int, bytes_per_value:int)->int:
    """Naive attention materialises (tokens,tokens) per head. Total bytes."""
    raise NotImplementedError

def tiled_attention(q, k, v, block_size=2):
    """Return causal softmax(q @ k.T / sqrt(D)) @ v without a full T x T matrix.

    q,k: finite arrays (T,D); v: (T,Dv); T,D,Dv > 0.
    block_size: positive integer. Process query and key blocks; handle tails.
    Track each row's maximum m, exponential sum l, and weighted value sum a.
    Skip key blocks entirely in the future; mask future entries within a tile.
    Use float64 accumulators and return (T,Dv). Raise ValueError for block_size<=0.
    """
    raise NotImplementedError

def tile_bytes(query_rows:int, key_rows:int, head_size:int, bytes_per_value:int)->int:
    """One tile: Q tile + K tile + V tile + score tile."""
    raise NotImplementedError
