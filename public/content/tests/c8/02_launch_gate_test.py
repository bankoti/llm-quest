passing={"quality":True,"latency_capacity_cost":True,"fallback_reliability":True,"security_privacy":True,"observability_ownership":True,"rollback":True}
assert can_launch(passing)
for gate in passing:
    assert not can_launch({**passing,gate:False}),f"gate {gate!r} must block"
print("✓ all gates enforced")
print("\n+200 XP — Launch Gate complete.")
