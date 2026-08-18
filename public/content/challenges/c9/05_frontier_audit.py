"""Level 70 — Frontier Config Audit

Derive architecture facts from a frontier model config.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class FrontierConfig:
    hidden_size: int
    num_layers: int
    num_q_heads: int
    num_kv_heads: int
    head_dim: int
    intermediate_size: int   # per SwiGLU matrix (two matrices used)
    vocab_size: int
    bytes_per_param: int = 2  # bfloat16

    @property
    def gqa_groups(self) -> int:
        """Number of query heads per KV head."""
        raise NotImplementedError

    def attention_params_per_layer(self) -> int:
        """
        Q projection: hidden_size * num_q_heads * head_dim
        K projection: hidden_size * num_kv_heads * head_dim
        V projection: hidden_size * num_kv_heads * head_dim
        O projection: num_q_heads * head_dim * hidden_size
        """
        raise NotImplementedError

    def ffn_params_per_layer(self) -> int:
        """
        SwiGLU: three matrices.
        gate:   hidden_size * intermediate_size
        up:     hidden_size * intermediate_size
        down:   intermediate_size * hidden_size
        """
        raise NotImplementedError

    def kv_cache_bytes(self, seq_len: int) -> int:
        """
        KV cache for the full model at a given sequence length.
        2 (K+V) * num_kv_heads * head_dim * bytes_per_param * seq_len * num_layers
        """
        raise NotImplementedError

    def total_params(self) -> int:
        """
        vocab embedding: vocab_size * hidden_size
        + attention (all layers)
        + ffn (all layers)
        Ignore norm and bias parameters.
        """
        raise NotImplementedError
