import numpy as np
target = 12.0; lr = 0.1; weight = 0.0
for _ in range(20):
    weight -= lr * dloss_dweight(weight, target)
assert abs(weight - 4.0) < 0.1, f"should converge to 4.0, got {weight:.4f}"
assert mse_loss(0.0, 1.0) == 1.0
assert abs(dloss_dweight(4.0, 12.0)) < 1e-9, "gradient at optimum ~0"
print(f"✓ weight converged to {weight:.4f}")
print("✓ gradient zero at optimum")
print("\n+150 XP — Gradients & Optimisation complete.")
