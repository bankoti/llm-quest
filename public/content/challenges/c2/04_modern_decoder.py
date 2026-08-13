"""Level 11 — BOSS: Modern Decoder Block 👑
Combine RMSNorm, GQA, SwiGLU into a Llama-style block.
"""
import numpy as np

def rms_norm(x, eps=1e-6):
    return x/np.sqrt((x**2).mean(axis=-1,keepdims=True)+eps)

def swiglu(x, W_gate, W_up, W_down):
    """silu(x@W_gate) * (x@W_up) @ W_down"""
    def silu(z): return z/(1+np.exp(-z))
    raise NotImplementedError

def modern_decoder_block(x, Wq,Wk,Wv,Wo, W_gate,W_up,W_down, n_heads, n_kv_heads):
    """Pre-norm residual with GQA and SwiGLU. (B,T,C)->(B,T,C)"""
    raise NotImplementedError
