got=kv_cache_bytes(layers=80,tokens=4096,query_heads=64,kv_heads=8,head_dim=128,bytes_per_scalar=2)
expect=2*80*4096*8*128*2
assert got==expect, f"Estimator says {got/2**30:.1f} GiB, correct is {expect/2**30:.1f} GiB. GQA exists precisely so the cache does NOT scale with one of these two head counts — which one?"
got2=kv_cache_bytes(layers=32,tokens=1024,query_heads=32,kv_heads=32,head_dim=64,bytes_per_scalar=2)
assert got2==2*32*1024*32*64*2, "MHA case (query_heads == kv_heads) broke."
print("✓ cache scales with kv_heads — GQA saves the memory it promised")
print("\n+150 XP — KV Cache Overcount debugged.")
