# ── auto-grader (appended to learner code, not shown in editor) ──────────────
import numpy as np

np.random.seed(7)
B, T, D = 2, 5, 4
q = np.random.randn(B, T, D)
k = np.random.randn(B, T, D)
v = np.random.randn(B, T, D)

output, weights = causal_attention(q, k, v)

assert output.shape == (B, T, D), \
    f"output shape: expected {(B,T,D)}, got {output.shape}"

assert weights.shape == (B, T, T), \
    f"weights shape: expected {(B,T,T)}, got {weights.shape}"

assert np.allclose(weights.sum(axis=-1), np.ones((B, T)), atol=1e-5), \
    "Each row of weights must sum to 1 (softmax rows)."

upper = np.triu(weights, k=1)
assert np.allclose(upper, 0, atol=1e-6), \
    "Causal mask violated: upper-triangle weights must be zero."

# Strongest test: changing a future token cannot affect earlier outputs
changed_v = v.copy()
changed_v[:, -1] += 100
changed_out, _ = causal_attention(q, k, changed_v)
assert np.allclose(output[:, :-1], changed_out[:, :-1], atol=1e-5), \
    "Causality violated: modifying a future position changed earlier outputs."

print("✓ Shape check passed")
print("✓ Rows sum to 1")
print("✓ Causal mask correct")
print("✓ Causality invariant holds")
print("\n+200 XP — Causal Self-Attention complete.")
