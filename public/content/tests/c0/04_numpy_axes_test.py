import numpy as np

M = np.array([[1.0, 3.0], [2.0, 6.0]])

# ── col_means ─────────────────────────────────────────────────────────────────
got = col_means(M)
assert got.shape == (2,), f"named axis disappears: shape {got.shape}"
assert np.allclose(got, [1.5, 4.5]), "means down each column"
print("✓ col_means correct")

# ── row_normalize ─────────────────────────────────────────────────────────────
R = row_normalize(M)
assert np.allclose(R.sum(axis=1), [1.0, 1.0]), "each row sums to 1"
assert np.allclose(R, [[0.25, 0.75], [0.25, 0.75]])
print("✓ row_normalize correct")

# ── pairwise_scores ───────────────────────────────────────────────────────────
A = np.array([[1.0, 0.0], [0.0, 2.0]])
B = np.array([[3.0, 1.0], [0.0, 1.0], [1.0, 1.0]])
S = pairwise_scores(A, B)
assert S.shape == (2, 3), "(n, d) x (m, d) -> (n, m)"
assert np.allclose(S, [[3.0, 0.0, 1.0], [2.0, 2.0, 2.0]])
print("✓ pairwise_scores correct")

# ── mask_scores ───────────────────────────────────────────────────────────────
scores = np.array([[1.0, 2.0], [3.0, 4.0]])
mask = np.array([[True, False], [True, True]])
out = mask_scores(scores, mask)
assert out[0, 1] == -np.inf, "masked position is -inf"
assert out[0, 0] == 1.0 and np.allclose(out[1], [3.0, 4.0]), "unmasked survive"
print("✓ mask_scores correct")

print("\n+100 XP — Axes & Matmul complete. Same moves in torch: axis->dim, keepdims->keepdim.")
