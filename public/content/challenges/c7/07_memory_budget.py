"""Memory-budget serving: fit a model and its KV cache into a device budget."""
import math


def model_bytes(params: int, bytes_per_param: float = 2.0) -> int:
    """Weight memory in bytes.

    params:          total parameter count (e.g. 7_000_000_000 for a 7B model)
    bytes_per_param: 2.0 for BF16, 1.0 for INT8, 0.5 for INT4
    Return the byte count as an int (use math.ceil to avoid rounding down).
    """
    raise NotImplementedError


def kv_cache_bytes(layers: int,
                   kv_heads: int,
                   head_dim: int,
                   seq_len: int,
                   batch_size: int,
                   bytes_per_kv: float = 2.0) -> int:
    """KV cache memory in bytes for a given batch and context length.

    The factor of 2 accounts for both K and V tensors.
    Return the byte count as an int (use math.ceil).
    """
    raise NotImplementedError


def max_batch_size(memory_budget_bytes: int,
                   params: int,
                   layers: int,
                   kv_heads: int,
                   head_dim: int,
                   seq_len: int,
                   bytes_per_param: float = 2.0,
                   bytes_per_kv: float = 2.0) -> int:
    """Maximum batch size that fits in memory_budget_bytes.

    Subtract weight bytes from the budget; divide the remainder by the
    per-sequence KV cost. Return floor of the result, minimum 0.
    If weights alone exceed the budget, return 0.
    """
    raise NotImplementedError


def recommend_quantization(params: int, memory_budget_bytes: int) -> str:
    """Recommend 'bf16', 'int8', or 'int4' based on what fits.

    Try BF16 first (2.0 bytes/param). If it does not fit, try INT8 (1.0).
    If that does not fit, try INT4 (0.5).
    If even INT4 does not fit, return 'int4' as a best-effort answer.
    """
    raise NotImplementedError
