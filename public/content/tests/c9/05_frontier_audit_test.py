# auto-grader: Llama 3 8B config
cfg = FrontierConfig(
    hidden_size=4096, num_layers=32,
    num_q_heads=32, num_kv_heads=8, head_dim=128,
    intermediate_size=14336, vocab_size=128256,
)

assert cfg.gqa_groups == 4, f"GQA groups: {cfg.gqa_groups}"

attn = cfg.attention_params_per_layer()
# Q: 4096*32*128=16M  K: 4096*8*128=4M  V: same  O: 32*128*4096=16M  => 40M
expected_attn = 4096*32*128 + 4096*8*128 + 4096*8*128 + 32*128*4096
assert attn == expected_attn, f"attn params: {attn} vs {expected_attn}"

ffn = cfg.ffn_params_per_layer()
# gate + up + down = 2*(4096*14336) + 14336*4096
expected_ffn = 2*(4096*14336) + 14336*4096
assert ffn == expected_ffn, f"ffn params: {ffn} vs {expected_ffn}"

kv = cfg.kv_cache_bytes(4096)
# 2 * 8 * 128 * 2 * 4096 * 32
expected_kv = 2 * 8 * 128 * 2 * 4096 * 32
assert kv == expected_kv, f"kv cache bytes: {kv} vs {expected_kv}"

total = cfg.total_params()
# rough check: should be around 8B
assert 7_000_000_000 < total < 9_000_000_000, f"total params out of range: {total:,}"

print(f"GQA groups: {cfg.gqa_groups}")
print(f"Attention params/layer: {attn/1e6:.1f}M")
print(f"FFN params/layer: {ffn/1e6:.1f}M")
print(f"KV cache (4K ctx): {kv/1024**2:.1f}MB across all layers")
print(f"Total params: {total/1e9:.2f}B")
print("\n+200 XP — Frontier Config Audit complete.")
