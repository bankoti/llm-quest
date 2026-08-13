"""Level 10 — Sparse MoE
Each token routes to top-k experts; only those activate.
"""
import numpy as np

def softmax(x):
    e=np.exp(x-x.max(axis=-1,keepdims=True)); return e/e.sum(axis=-1,keepdims=True)

def route(expert_outputs: np.ndarray, router_logits: np.ndarray, k: int) -> np.ndarray:
    """
    expert_outputs: (tokens, experts, width)
    router_logits:  (tokens, experts)
    Returns: (tokens, width) — top-k weighted combination.
    """
    raise NotImplementedError
