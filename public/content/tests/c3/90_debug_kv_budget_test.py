# KV cache budget estimator — behavioral tests

# 1. GQA case: cache must scale with kv_heads, not query_heads
got=kv_cache_bytes(layers=80,tokens=4096,query_heads=64,kv_heads=8,head_dim=128,bytes_per_scalar=2)
expect=2*80*4096*8*128*2
assert got==expect, f"Estimated {got/(2**30):.1f} GiB but expected {expect/(2**30):.1f} GiB — the cache scales with the wrong head count"

# 2. MHA case: when query_heads == kv_heads, both must agree
got2=kv_cache_bytes(layers=32,tokens=1024,query_heads=32,kv_heads=32,head_dim=64,bytes_per_scalar=2)
expect2=2*32*1024*32*64*2
assert got2==expect2, f"MHA case: expected {expect2} bytes, got {got2}"

# 3. Doubling tokens must double cache size (linear scaling)
half=kv_cache_bytes(layers=80,tokens=2048,query_heads=64,kv_heads=8,head_dim=128,bytes_per_scalar=2)
assert got==2*half, "Cache should scale linearly with token count"

# 4. Doubling layers must double cache size
fewer_layers=kv_cache_bytes(layers=40,tokens=4096,query_heads=64,kv_heads=8,head_dim=128,bytes_per_scalar=2)
assert got==2*fewer_layers, "Cache should scale linearly with layer count"

# 5. MQA case (single kv_head): minimal cache
mqa=kv_cache_bytes(layers=32,tokens=1024,query_heads=32,kv_heads=1,head_dim=64,bytes_per_scalar=2)
assert mqa==2*32*1024*1*64*2, "MQA (kv_heads=1) should give minimal cache"

print("✓ cache scales with kv_heads — GQA saves the memory it promised")
print("\n+150 XP — KV Cache Overcount debugged.")
