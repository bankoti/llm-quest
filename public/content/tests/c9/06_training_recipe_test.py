# auto-grader — part 1: validate() must judge known recipes correctly
_good = dict(params=10_000_000_000, tokens=3_000_000_000_000, num_kv_heads=8,
             head_dim=128, num_layers=32, beta=0.1,
             log_pi_chosen_minus_ref=0.5, log_pi_rejected_minus_ref=-0.5)
_r = TrainingRecipe(**_good).validate()
assert _r.passed, "a known-good recipe (10B, 3T tokens) must pass all four checks"

_r = TrainingRecipe(**{**_good, "tokens": 40_000_000_000_000}).validate()
assert not _r.compute_ok, "6*N*D = 2.4e24 must fail the 2e23 compute budget"
assert _r.memory_ok and _r.alignment_ok, "only the compute check should fail here"

_r = TrainingRecipe(**{**_good, "params": 30_000_000_000}).validate()
assert not _r.memory_ok, "30B at bf16 is 60GB and must fail the 40GB check"
assert not _r.kv_cache_ok, "when the weights do not fit, nothing remains for KV"

_r = TrainingRecipe(**{**_good, "num_layers": 80, "num_kv_heads": 32}).validate()
assert _r.memory_ok and not _r.kv_cache_ok, "a huge KV cache must fail even when weights fit"

assert not TrainingRecipe(**{**_good, "beta": 0.0}).validate().alignment_ok
assert not TrainingRecipe(**{**_good, "log_pi_rejected_minus_ref": 0.2}).validate().alignment_ok
print("✓ validate() judges good and bad recipes correctly")

# part 2: your recipe must pass — verified independently of your validate()
actual_flops = 6 * recipe.params * recipe.tokens
model_gb = recipe.params * 2 / 1e9
kv_bytes = (2 * recipe.num_kv_heads * recipe.head_dim * 2 *
            recipe.num_layers * 64 * 2048)
assert recipe.params > 0 and recipe.tokens > 0, "fill in the recipe values"
assert actual_flops <= 2e23, f"compute: {actual_flops:.2e} > 2e23"
assert model_gb <= 40.0, f"memory: {model_gb:.1f}GB > 40GB"
assert kv_bytes / 1e9 <= 40.0 - model_gb, f"kv_cache: {kv_bytes/1e9:.1f}GB does not fit"
assert 0 < recipe.beta <= 1.0
assert recipe.log_pi_chosen_minus_ref > 0 and recipe.log_pi_rejected_minus_ref < 0
report = recipe.validate()
assert report.passed, "your own validate() must agree that your recipe passes"
print("✓ recipe satisfies compute, memory, KV cache, and alignment")

print(f"Params:          {recipe.params/1e9:.2f}B")
print(f"Tokens:          {recipe.tokens/1e12:.1f}T")
print(f"Training FLOPs:  {actual_flops:.2e}")
print(f"Model memory:    {model_gb:.1f}GB")
print(f"KV cache (64x2048): {kv_bytes/1e9:.1f}GB")
print(f"DPO beta:        {recipe.beta}")
print("\n+1000 XP — Training Recipe Defense complete.")
