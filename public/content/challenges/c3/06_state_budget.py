"""Level 19 — BOSS: Architecture Defense 👑
"""
def kv_cache_bytes(layers,tokens,kv_heads,head_dim,bytes_per_scalar=2)->int:
    raise NotImplementedError

def compressed_state_bytes(layers,tokens,cached_width,bytes_per_scalar=2)->int:
    """layers × tokens × cached_width × bytes_per_scalar.
    One latent vector per layer (no K+V split — the whole point of MLA).
    """
    raise NotImplementedError
