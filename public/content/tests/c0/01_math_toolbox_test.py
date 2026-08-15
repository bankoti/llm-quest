import math

# ── ceil_div ──────────────────────────────────────────────────────────────────
assert ceil_div(7, 2) == 4, "7 items in size-2 buckets needs 4 buckets"
assert ceil_div(6, 2) == 3, "exact fit: no extra bucket"
assert ceil_div(1, 8) == 1, "anything nonzero needs at least one"
assert ceil_div(140_000_000_000, 80_000_000_000) == 2, "140GB model on 80GB GPUs"
print("✓ ceil_div correct")

# ── solve_exponent ────────────────────────────────────────────────────────────
assert solve_exponent(0.7, 0.1) == 7,  "0.7^7 ~ 0.082 <= 0.1"
assert solve_exponent(0.8, 0.1) == 11, "0.8^11 ~ 0.086 <= 0.1"
assert solve_exponent(0.5, 0.5) == 1,  "already there in one step"
print("✓ solve_exponent correct")

# ── n_choose_k ────────────────────────────────────────────────────────────────
assert n_choose_k(5, 3) == 10, "C(5,3)"
assert n_choose_k(5, 0) == 1,  "one way to pick nothing"
assert n_choose_k(52, 5) == 2_598_960, "poker hands, exactly"
print("✓ n_choose_k correct")

# ── close_enough ──────────────────────────────────────────────────────────────
assert (0.1 + 0.2 == 0.3) is False, "yes, really: floats are binary"
assert close_enough(0.1 + 0.2, 0.3) is True, "isclose handles it"
assert close_enough(1.0, 1.1) is False, "but it is not sloppy"
print("✓ close_enough correct")

print("\n+100 XP — Math Toolbox complete.")
