import math

# ── model_bytes ───────────────────────────────────────────────────────────────
assert model_bytes(7_000_000_000, 2.0) == 14_000_000_000,  "7B BF16"
assert model_bytes(7_000_000_000, 1.0) == 7_000_000_000,   "7B INT8"
assert model_bytes(7_000_000_000, 0.5) == 3_500_000_000,   "7B INT4"
assert model_bytes(70_000_000_000, 2.0) == 140_000_000_000, "70B BF16"
print("✓ model_bytes correct")

# ── kv_cache_bytes ────────────────────────────────────────────────────────────
# 32 layers, 8 KV heads, head_dim 128, 4096 tokens, batch 1, BF16
expected = 2 * 32 * 8 * 128 * 4096 * 1 * 2
got = kv_cache_bytes(layers=32, kv_heads=8, head_dim=128,
                     seq_len=4096, batch_size=1, bytes_per_kv=2.0)
assert got == expected, f"kv_cache_bytes: {got} != {expected}"
# INT8 KV should be half
got_int8 = kv_cache_bytes(layers=32, kv_heads=8, head_dim=128,
                          seq_len=4096, batch_size=1, bytes_per_kv=1.0)
assert got_int8 == expected // 2, "INT8 KV should halve the cache"
print("✓ kv_cache_bytes correct")

# ── max_batch_size ────────────────────────────────────────────────────────────
# 7B BF16 weights = 14 GB; budget 24 GB; remainder = 10 GB
# per-sequence KV (32L, 8H, 128D, 4096T, BF16) = 2*32*8*128*4096*2 = 536,870,912 bytes
# max_batch = floor(10 GB / 536 MB) = 18
budget = 24 * 1024**3
weight = model_bytes(7_000_000_000, 2.0)
per_seq = kv_cache_bytes(32, 8, 128, 4096, 1, 2.0)
expected_batch = math.floor((budget - weight) / per_seq)
got_batch = max_batch_size(budget, 7_000_000_000, 32, 8, 128, 4096, 2.0, 2.0)
assert got_batch == expected_batch, f"max_batch_size: {got_batch} != {expected_batch}"
# weights > budget => 0
assert max_batch_size(1_000_000, 7_000_000_000, 32, 8, 128, 4096) == 0
print("✓ max_batch_size correct")

# ── recommend_quantization ────────────────────────────────────────────────────
# 7B model, 24 GB budget: BF16=14GB fits -> 'bf16'
assert recommend_quantization(7_000_000_000,  24 * 1024**3) == 'bf16'
# 70B model, 24 GB budget: BF16=140GB, INT8=70GB don't fit; INT4=35GB doesn't fit either
# but INT4 is best-effort
assert recommend_quantization(70_000_000_000, 24 * 1024**3) == 'int4'
# 13B model, 24 GB budget: BF16=26GB no, INT8=13GB fits -> 'int8'
assert recommend_quantization(13_000_000_000, 24 * 1024**3) == 'int8'
# 40B model, 24 GB budget: BF16=80GB no, INT8=40GB no, INT4=20GB fits -> 'int4'
assert recommend_quantization(40_000_000_000, 24 * 1024**3) == 'int4'
print("✓ recommend_quantization correct")

print("\n+200 XP — Memory-Budget Serving complete.")
