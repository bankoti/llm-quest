"""Level 13 — KV Cache Arithmetic
Derive exact byte counts for MHA, GQA, MQA.
"""
def cache_bytes(layers:int, tokens:int, kv_heads:int, head_size:int, bytes_per_value:int=2)->int:
    """2(K+V) * layers * tokens * kv_heads * head_size * bytes"""
    raise NotImplementedError
