"""Level 14 — Information Flow
Bidirectional sees all. Causal sees only past. Cross-attention sees encoder.
"""
from typing import Set

def bidirectional_reach(length:int, query_pos:int)->Set[int]:
    raise NotImplementedError

def causal_reach(length:int, query_pos:int)->Set[int]:
    raise NotImplementedError

def cross_attention_reach(encoder_length:int, decoder_length:int, decoder_pos:int)->Set[int]:
    raise NotImplementedError
