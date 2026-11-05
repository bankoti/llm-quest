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

# Numerical reference rejects causal-looking uniform/identity attention.
for seed, shape in [(18, (1, 3, 2)), (24, (2, 6, 4))]:
    rng = np.random.default_rng(seed)
    q, k, v = [rng.normal(size=shape) for _ in range(3)]
    expected_weights = np.zeros((shape[0], shape[1], shape[1]))
    expected_output = np.zeros(shape)
    for batch in range(shape[0]):
        for time in range(shape[1]):
            scores = np.array([np.dot(q[batch,time], k[batch,j])/np.sqrt(shape[2]) for j in range(time+1)])
            probabilities = np.exp(scores-scores.max()); probabilities /= probabilities.sum()
            expected_weights[batch,time,:time+1] = probabilities
            expected_output[batch,time] = sum(probabilities[j]*v[batch,j] for j in range(time+1))
    actual, weights = causal_attention(q,k,v)
    assert np.allclose(weights,expected_weights), 'Scaled QK scores must determine attention weights'
    assert np.allclose(actual,expected_output), 'Output must mix values using those weights'

print("✓ Shape check passed")
print("✓ Rows sum to 1")
print("✓ Causal mask correct")
print("✓ Causality invariant holds")
print("\n+200 XP — Causal Self-Attention complete.")
