"""Level 12 — IO-Aware Attention
Derive memory traffic. Pure arithmetic — no tensors.
"""
def score_matrix_bytes(batch:int, heads:int, tokens:int, bytes_per_value:int)->int:
    """Naive attention materialises (tokens,tokens) per head. Total bytes."""
    raise NotImplementedError

def tile_bytes(query_rows:int, key_rows:int, head_size:int, bytes_per_value:int)->int:
    """One tile: Q tile + K tile + V tile + score tile."""
    raise NotImplementedError
