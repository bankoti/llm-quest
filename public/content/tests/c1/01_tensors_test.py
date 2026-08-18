import numpy as np
np.random.seed(1)
B,T,C,H = 2,5,12,3

assert last_two.shape == (B,2,C), f"last_two: got {last_two.shape}"
assert heads.shape == (B,H,T,C//H), f"heads: got {heads.shape}"
assert scores.shape == (B,H,T,T), f"scores: got {scores.shape}"
# value correctness (rules out np.zeros shortcuts)
x_seed = np.random.randn(B, T, C)  # fresh draw with same seed state
assert np.allclose(last_two, x[:, -2:, :]), "last_two: wrong slice"
assert np.allclose(heads, x.reshape(B, T, H, C//H).transpose(0, 2, 1, 3)), \
    "heads: wrong reshape/transpose"
expected_scores = heads @ heads.transpose(0, 1, 3, 2)
assert np.allclose(scores, expected_scores, atol=1e-6), \
    "scores: must be heads @ heads.transpose(0,1,3,2)"
print("✓ last_two shape correct")
print("✓ heads shape correct")
print("✓ scores shape correct")
print("\n+100 XP — Tensors & Shapes complete.")
