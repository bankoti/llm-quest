"""Debug — KV Cache Overcount 🐛
An AI assistant wrote the memory estimator for your GQA deployment. Finance
says the numbers look high. ONE conceptual bug.
"""
def kv_cache_bytes(layers, tokens, query_heads, kv_heads, head_dim, bytes_per_scalar=2):
    """Total KV cache bytes for one sequence in a GQA decoder."""
    return 2 * layers * tokens * query_heads * head_dim * bytes_per_scalar
