# auto-grader
report = recipe.validate()

if not report.passed:
    for note in report.notes:
        print(f"  FAIL: {note}")
    raise AssertionError(
        f"Recipe did not pass all checks. "
        f"compute={report.compute_ok} memory={report.memory_ok} "
        f"kv={report.kv_cache_ok} align={report.alignment_ok}"
    )

import math
actual_flops = 6 * recipe.params * recipe.tokens
model_gb = recipe.params * 2 / 1e9
kv_bytes = (2 * recipe.num_kv_heads * recipe.head_dim * 2 *
            recipe.num_layers * 64 * 2048)

print(f"Params:          {recipe.params/1e9:.2f}B")
print(f"Tokens:          {recipe.tokens/1e12:.1f}T")
print(f"Training FLOPs:  {actual_flops:.2e}")
print(f"Model memory:    {model_gb:.1f}GB")
print(f"KV cache (64x2048): {kv_bytes/1e9:.1f}GB")
print(f"DPO beta:        {recipe.beta}")
print("\n+1000 XP — Training Recipe Defense complete.")
