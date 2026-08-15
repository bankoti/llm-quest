import numpy as np

# ── compress_kv ──────────────────────────────────────────────────────────────
B, T, C, d_c = 2, 5, 16, 4
np.random.seed(0)
x      = np.random.randn(B, T, C)
W_DKV  = np.random.randn(C, d_c)
c_kv   = compress_kv(x, W_DKV)
assert c_kv.shape == (B, T, d_c), f"compress_kv shape: {c_kv.shape}"
assert np.allclose(c_kv, x @ W_DKV), "compress_kv values wrong"
print("✓ compress_kv shape and values correct")

# ── expand_kv ────────────────────────────────────────────────────────────────
H_kv, D = 2, 3
W_UK = np.random.randn(d_c, H_kv * D)
W_UV = np.random.randn(d_c, H_kv * D)
K, V = expand_kv(c_kv, W_UK, W_UV)
assert K.shape == (B, T, H_kv * D), f"K shape: {K.shape}"
assert V.shape == (B, T, H_kv * D), f"V shape: {V.shape}"
assert np.allclose(K, c_kv @ W_UK), "K values wrong"
assert np.allclose(V, c_kv @ W_UV), "V values wrong"
print("✓ expand_kv shapes and values correct")

# ── mla_cache_bytes ───────────────────────────────────────────────────────────
# 4 layers, batch 2, seq 1024, d_c 512, BF16 (2 bytes)
expected = 4 * 2 * 1024 * 512 * 2
got = mla_cache_bytes(seq_len=1024, d_c=512, n_layers=4,
                      batch_size=2, bytes_per_element=2)
assert got == expected, f"mla_cache_bytes: expected {expected}, got {got}"
print("✓ mla_cache_bytes correct")

# ── cache_reduction_factor ────────────────────────────────────────────────────
# DeepSeek-V2 style: 128 KV heads, D=128, d_c=512
# standard = 2 * 128 * 128 = 32768; mla = 512; ratio = 64.0
ratio = cache_reduction_factor(n_kv_heads=128, head_dim=128, d_c=512)
assert abs(ratio - 64.0) < 1e-6, f"cache_reduction_factor: expected 64.0, got {ratio}"
# Llama-3-style GQA (8 KV heads, D=128) vs d_c=256
ratio2 = cache_reduction_factor(n_kv_heads=8, head_dim=128, d_c=256)
assert abs(ratio2 - 8.0) < 1e-6, f"reduction vs GQA: expected 8.0, got {ratio2}"
print("✓ cache_reduction_factor correct")

print("\n+200 XP — Multi-head Latent Attention complete.")
