import math

# ── acceptance_prob ───────────────────────────────────────────────────────────
assert math.isclose(acceptance_prob(0.3, 0.6), 0.5), "p < q: accept with p/q"
assert acceptance_prob(0.6, 0.3) == 1.0, "p >= q: always accept"
assert acceptance_prob(0.4, 0.4) == 1.0, "p == q: always accept"
print("✓ acceptance_prob correct")

# ── simulate_verify ───────────────────────────────────────────────────────────
# token 0: u=0.1 < 1.0 accept; token 1: u=0.6 >= 0.5 reject -> 1 accepted + 1 corrected
assert simulate_verify([1.0, 0.5, 0.9], [0.1, 0.6, 0.2]) == 2, "reject mid-draft"
# all accepted -> gamma + 1 bonus
assert simulate_verify([1.0, 1.0, 1.0], [0.5, 0.5, 0.5]) == 4, "full acceptance"
# immediate rejection -> still 1 token (the corrected sample)
assert simulate_verify([0.2], [0.9]) == 1, "instant rejection still yields 1"
print("✓ simulate_verify correct")

# ── expected_tokens ───────────────────────────────────────────────────────────
assert math.isclose(expected_tokens(4, 0.8), 3.3616), "Leviathan Eq. 1"
assert math.isclose(expected_tokens(4, 0.0), 1.0), "alpha=0: only the correction"
assert expected_tokens(3, 1.0) == 4.0, "alpha=1: whole draft + bonus"
print("✓ expected_tokens correct")

# ── speedup ───────────────────────────────────────────────────────────────────
assert math.isclose(speedup(4, 0.8, 0.1), 3.3616 / 1.4), "4-draft, 10x-cheaper draft"
# free draft (c=0): speedup equals expected tokens
assert math.isclose(speedup(4, 0.8, 0.0), 3.3616), "free draft"
# useless draft (alpha=0) with nonzero cost: slower than baseline
assert speedup(4, 0.0, 0.1) < 1.0, "rejected drafts make you slower"
print("✓ speedup correct")

# ── best_gamma ────────────────────────────────────────────────────────────────
assert best_gamma(0.8, 0.1, 8) == 6, "high alpha, cheap draft: go long"
assert best_gamma(0.5, 0.5, 8) == 1, "expensive draft: barely worth one token"
print("✓ best_gamma correct")

print("\n+200 XP — Speculative Decoding complete.")
