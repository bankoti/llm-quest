# ── top_k ─────────────────────────────────────────────────────────────────────
assert top_k([0.3, 0.9, 0.5], 2) == [1, 2], "indices of the two best, best first"
assert top_k([5, 1, 4, 2], 3) == [0, 2, 3], "descending by score"
assert top_k([7], 1) == [0], "single element"
print("✓ top_k correct")

# ── argmax ────────────────────────────────────────────────────────────────────
assert argmax([2, 7, 7]) == 1, "ties keep the FIRST maximum"
assert argmax([9, 1, 3]) == 0, "max at the front"
assert argmax([-5, -2, -9]) == 1, "works on negatives"
print("✓ argmax correct")

# ── count_labels ──────────────────────────────────────────────────────────────
assert count_labels(['a', 'b', 'a']) == {'a': 2, 'b': 1}
assert count_labels([]) == {}, "empty in, empty out"
assert count_labels(['x', 'x', 'x']) == {'x': 3}
print("✓ count_labels correct")

# ── pair_deltas ───────────────────────────────────────────────────────────────
assert pair_deltas([10, 20, 30], [12, 18, 33]) == [2, -2, 3], "after minus before"
assert pair_deltas([], []) == [], "empty in, empty out"
print("✓ pair_deltas correct")

print("\n+100 XP — Collections & Comprehensions complete.")
