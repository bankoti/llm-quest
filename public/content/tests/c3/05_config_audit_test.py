cfg=DecoderConfig(width=4096,layers=32,query_heads=32,kv_heads=8,head_dim=128,intermediate_width=11008)
cfg.validate()
assert cfg.query_width==4096
assert cfg.queries_per_kv_head==4
assert cfg.kv_cache_bytes(8192)==1_073_741_824
try:
    DecoderConfig(4096,32,30,8,128,11008).validate()
    raise AssertionError("should raise")
except ValueError as e:
    assert "divis" in str(e).lower(),str(e)
print(f"✓ query_width={cfg.query_width}")
print(f"✓ GQA group={cfg.queries_per_kv_head}")
print(f"✓ KV cache={cfg.kv_cache_bytes(8192)/1024**3:.1f}GiB")
print("\n+150 XP — Config Forensics complete.")
