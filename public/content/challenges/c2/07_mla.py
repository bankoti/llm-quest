"""Multi-head Latent Attention: compress-expand KV projections."""
import numpy as np


def compress_kv(x: np.ndarray, W_DKV: np.ndarray) -> np.ndarray:
    """Project hidden states into the KV latent.

    x:     (B, T, C)     hidden states
    W_DKV: (C, d_c)      down-projection weight
    return (B, T, d_c)   compressed latent c_KV
    """
    raise NotImplementedError


def expand_kv(c_kv: np.ndarray,
              W_UK: np.ndarray,
              W_UV: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Reconstruct K and V from the latent.

    c_kv: (B, T, d_c)
    W_UK: (d_c, H_kv * D)   up-projection for K
    W_UV: (d_c, H_kv * D)   up-projection for V
    return: K (B, T, H_kv * D),  V (B, T, H_kv * D)
    """
    raise NotImplementedError


def mla_cache_bytes(seq_len: int,
                    d_c: int,
                    n_layers: int,
                    batch_size: int,
                    bytes_per_element: int = 2) -> int:
    """Total KV cache bytes for an MLA model.

    Only c_KV is cached — not the reconstructed K and V.
    One latent tensor of shape (batch_size, seq_len, d_c) per layer.
    Return the total byte count across all layers.
    """
    raise NotImplementedError


def cache_reduction_factor(n_kv_heads: int,
                           head_dim: int,
                           d_c: int) -> float:
    """How many times smaller is the MLA cache vs a standard GQA cache?

    Standard GQA caches K and V separately:
      bytes_per_token = 2 * n_kv_heads * head_dim   (K + V, same element size)
    MLA caches only c_KV:
      bytes_per_token = d_c

    Return standard / mla (a float >= 1.0).
    Element size cancels; do not include it.
    """
    raise NotImplementedError
