base={"layers":32,"tokens":8192,"head_dim":128}
mha=kv_cache_bytes(**base,kv_heads=32)
gqa=kv_cache_bytes(**base,kv_heads=8)
mqa=kv_cache_bytes(**base,kv_heads=1)
comp=compressed_state_bytes(layers=32,tokens=8192,cached_width=512)
assert mha//gqa==4; assert gqa//mqa==8; assert comp==mqa*2
print(f"✓ MHA={mha/2**30:.2f}GiB GQA={gqa/2**30:.2f}GiB MQA={mqa/2**30:.3f}GiB")
print("\n+500 XP — Architecture Defense. Boss fight won. 🏆")
