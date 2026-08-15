import math

# ── best_of_n ─────────────────────────────────────────────────────────────────
assert math.isclose(best_of_n(0.3, 1), 0.3), "n=1 is just p"
assert math.isclose(best_of_n(0.3, 10), 1 - 0.7**10), "10 tries at 30%"
assert best_of_n(0.3, 10) > 0.97, "weak model, many samples, strong ceiling"
print("✓ best_of_n correct")

# ── majority_vote ─────────────────────────────────────────────────────────────
assert math.isclose(majority_vote(0.6, 1), 0.6), "n=1 is just p"
assert math.isclose(majority_vote(0.6, 5), 0.68256), "voting amplifies p > 0.5"
assert math.isclose(majority_vote(0.4, 5), 0.31744), "voting amplifies errors too"
assert majority_vote(0.6, 5) > majority_vote(0.6, 1), "more votes help above 0.5"
assert majority_vote(0.4, 5) < majority_vote(0.4, 1), "more votes hurt below 0.5"
print("✓ majority_vote correct")

# ── samples_needed ────────────────────────────────────────────────────────────
assert samples_needed(0.3, 0.9) == 7,  "0.7^7 ~ 0.082 <= 0.1"
assert samples_needed(0.95, 0.9) == 1, "already above target"
assert samples_needed(0.2, 0.9) == 11, "0.8^11 ~ 0.086 <= 0.1"
print("✓ samples_needed correct")

# ── cheaper_strategy ──────────────────────────────────────────────────────────
# 8B at p=0.3 needs 7 samples: 7 * 16 GFLOPs/token = 112 < 140 for one 70B pass
assert cheaper_strategy(0.3, 8_000_000_000, 70_000_000_000, 0.9) == 'small'
# 8B at p=0.2 needs 11 samples: 176 > 140 -> the big model wins
assert cheaper_strategy(0.2, 8_000_000_000, 70_000_000_000, 0.9) == 'large'
print("✓ cheaper_strategy correct")

print("\n+200 XP — Test-Time Compute complete.")
