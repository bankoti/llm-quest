# auto-grader
import math

budget = TrainingBudget(2e23)
rec = budget.recommend()

# The original recommend() passes (math is correct)
expected_N = int(0.2 * math.sqrt(2e23))
assert rec["params"] == expected_N, "original N* calculation broken"

# But the model is too large to serve in 40GB at bfloat16
model_gb = rec["params"] * 2 / 1e9
assert model_gb > 40, (
    f"Test assumption wrong: {model_gb:.1f}GB should exceed 40GB; "
    f"params={rec['params']:,}"
)

# fixed_recommend must satisfy both constraints
fixed = fixed_recommend(2e23, 40.0)
assert "params" in fixed and "tokens" in fixed

fixed_gb = fixed["params"] * 2 / 1e9
assert fixed_gb <= 40.0, f"fixed model too large: {fixed_gb:.1f}GB"

fixed_flops = 6 * fixed["params"] * fixed["tokens"]
assert fixed_flops <= 2e23 * 1.01, f"fixed exceeds compute budget: {fixed_flops:.2e}"

print(f"Original (Chinchilla): {rec['params']/1e9:.1f}B params, {model_gb:.0f}GB")
print(f"Fixed (inference-aware): {fixed['params']/1e9:.1f}B params, {fixed_gb:.1f}GB")
print("\n+150 XP — Debug: Budget That Forgot Inference — solved.")
