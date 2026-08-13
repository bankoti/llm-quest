import hashlib
first=manifest_digest({"model":"sha256:abc","index":"sha256:def"})
second=manifest_digest({"index":"sha256:def","model":"sha256:abc"})
assert first==second,"must be order-independent"
changed=manifest_digest({"model":"sha256:abc-v2","index":"sha256:def"})
assert first!=changed
assert len(first)==64
print("✓ order-independent digest")
print("✓ changed artifact changes digest")
print("\n+150 XP — Artifact Manifest complete.")
