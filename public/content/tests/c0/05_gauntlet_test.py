import numpy as np

# ── gpus_needed ───────────────────────────────────────────────────────────────
assert gpus_needed(140_000_000_000, 80_000_000_000) == 2, "140GB on 80GB cards"
assert gpus_needed(80_000_000_000, 80_000_000_000) == 1, "exact fit"
assert gpus_needed(81_000_000_000, 80_000_000_000) == 2, "one byte over: new card"
print("✓ gpus_needed correct")

# ── cheapest_config ───────────────────────────────────────────────────────────
assert cheapest_config({'a10g': 1.2, 'h100': 4.5, 't4': 0.6}) == 't4'
assert cheapest_config({'b': 1.0, 'a': 1.0}) == 'a', "tie: alphabetically first"
print("✓ cheapest_config correct")

# ── accuracy_by_model ─────────────────────────────────────────────────────────
res = [('small', [True, False, True, True]), ('large', [True, True])]
acc = accuracy_by_model(res)
assert acc == {'small': 0.75, 'large': 1.0}
assert accuracy_by_model([('empty', [])]) == {'empty': 0.0}, "no answers is 0.0, not a crash"
print("✓ accuracy_by_model correct")

# ── route_queries ─────────────────────────────────────────────────────────────
Q = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
K = np.array([[2.0, 0.0], [0.0, 1.0]])
routes = route_queries(Q, K)
assert routes == [0, 1, 0], "each query to its best-scoring expert"
assert isinstance(routes, list) and all(isinstance(r, int) for r in routes), "plain ints"
print("✓ route_queries correct")

print("\n+250 XP — Toolkit Gauntlet complete. The nine courses use nothing you have not now written.")
