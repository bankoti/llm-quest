# ── clamp ─────────────────────────────────────────────────────────────────────
assert clamp(5, 0, 3) == 3, "above the range: hi"
assert clamp(-2, 0, 3) == 0, "below the range: lo"
assert clamp(2, 0, 3) == 2, "inside: unchanged"
print("✓ clamp correct")

# ── safe_ratio ────────────────────────────────────────────────────────────────
assert safe_ratio(10, 4) == 2.5
assert safe_ratio(10, 0) == 0.0, "zero denominator: default"
assert safe_ratio(10, 0, default=-1.0) == -1.0, "caller-chosen default"
print("✓ safe_ratio correct")

# ── missing_keys ──────────────────────────────────────────────────────────────
assert missing_keys({'lr': 3e-4}, ['lr', 'batch', 'steps']) == ['batch', 'steps']
assert missing_keys({'a': 1, 'b': 2}, ['b', 'a']) == [], "nothing missing"
assert missing_keys({}, ['x']) == ['x'], "empty config misses everything"
print("✓ missing_keys correct")

# ── range_error ───────────────────────────────────────────────────────────────
assert range_error('lr', 0.5, 0, 1) == '', "in range: empty string"
assert range_error('lr', 5, 0, 1) == 'lr=5 outside [0, 1]', "exact format required"
assert range_error('temp', -0.1, 0.0, 2.0) == 'temp=-0.1 outside [0.0, 2.0]'
print("✓ range_error correct")

print("\n+100 XP — Functions & Contracts complete.")
