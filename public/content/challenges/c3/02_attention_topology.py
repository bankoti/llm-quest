"""Level 15 — Attention Topology: Reach Through Layers
"""
from typing import Optional

def one_layer_reach(length:int, query_pos:int, window:Optional[int])->set:
    """window=None: causal full. window=W: last W positions."""
    raise NotImplementedError

def compose_reach(prev_reach:list, curr_layer_reach:list)->list:
    """For each query, union prev_reach of all its direct sources."""
    raise NotImplementedError
