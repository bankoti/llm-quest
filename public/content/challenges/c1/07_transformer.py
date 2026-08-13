"""Level 7 — BOSS: The Transformer 👑
Assemble a GPT-style decoder: embeddings, multi-head causal attention,
feed-forward, residual connections, LayerNorm. All in numpy.
"""
import numpy as np

def layer_norm(x, eps=1e-5):
    m = x.mean(axis=-1, keepdims=True)
    v = x.var(axis=-1, keepdims=True)
    return (x - m) / np.sqrt(v + eps)

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def causal_attention(Q, K, V):
    """Q,K,V: (B,T,D). Returns (B,T,D)."""
    raise NotImplementedError

def multihead_attention(x, Wq, Wk, Wv, Wo, n_heads):
    """Project -> split heads -> attend -> concat -> Wo."""
    raise NotImplementedError

def feed_forward(x, W1, W2):
    """Linear -> ReLU -> Linear."""
    raise NotImplementedError

def transformer_block(x, Wq, Wk, Wv, Wo, W1, W2, n_heads):
    """Pre-norm residual: attn then ff."""
    raise NotImplementedError
