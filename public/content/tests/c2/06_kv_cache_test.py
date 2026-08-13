gqa=cache_bytes(32,8192,8,128,2)
mha=cache_bytes(32,8192,32,128,2)
mqa=cache_bytes(32,8192,1,128,2)
assert gqa==1024**3,f"GQA=1GiB, got {gqa/1024**3:.2f}GiB"
assert mha//gqa==4,f"MHA=4xGQA, got {mha//gqa}x"
assert gqa//mqa==8,f"GQA=8xMQA, got {gqa//mqa}x"
print(f"✓ MHA={mha/1024**3:.1f}GiB, GQA={gqa/1024**3:.1f}GiB, MQA={mqa/1024**3:.3f}GiB")
print("\n+200 XP — KV Cache Arithmetic complete.")
