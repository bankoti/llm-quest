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

def switch_forward(x, router_logits, experts, capacity_factor=1.0):
    """Execute a top-1 Switch FFN on x (T,D), T>0.

    experts is a list of E callables mapping a batch (n,D) to (n,D).
    Compute softmax probabilities over ALL E experts; argmax ties pick first.
    Capacity per expert = ceil(capacity_factor*T/E), factor must be >0.
    Accept earliest assigned tokens up to capacity. Only call experts with
    accepted tokens, once per used expert. Multiply output by selected ORIGINAL
    probability (do not renormalize it to 1). Overflow output is zero: the
    surrounding Transformer residual would preserve the input.
    Return (output, accepted_mask, auxiliary_loss).
    accepted_mask has shape (T,), dtype bool.
    auxiliary_loss = E * sum(f_i * P_i), where f counts ALL pre-capacity
    assignments divided by T, and P is mean router probability per expert.
    No loss coefficient is included. Raise ValueError for nonpositive factor.
    """
    raise NotImplementedError
