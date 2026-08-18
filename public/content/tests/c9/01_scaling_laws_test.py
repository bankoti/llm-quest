# auto-grader appended to learner code
import math

budget = 1e23
result = chinchilla_optimal(budget)
assert isinstance(result, dict), "return a dict"
N = result["params"]
D = result["tokens"]
expected_N = int(math.sqrt(budget / 120))
assert abs(N - expected_N) <= 1, f"params: expected ~{expected_N}, got {N}"
assert D == 20 * N, f"tokens should be 20*N, got {D}"

flops = training_flops(1_000_000, 10_000)
assert abs(flops - 6e10) < 1, f"flops wrong: {flops}"

mem = inference_memory_gb(7_000_000_000)
assert abs(mem - 14.0) < 0.1, f"memory: expected ~14GB, got {mem:.2f}GB"

# Chinchilla-optimal for 2e23
r2 = chinchilla_optimal(2e23)
assert r2["tokens"] == 20 * r2["params"], "D* = 20*N* must hold"

print(f"N* = {result['params']:,}")
print(f"D* = {result['tokens']:,}")
print(f"Training FLOPs estimate: {training_flops(r2['params'], r2['tokens']):.2e}")
print("\n+150 XP — Scaling Laws complete.")
