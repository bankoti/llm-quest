b=Metrics(.80,.010,150.)
assert can_promote(b,Metrics(.83,.012,160.),minimum_quality_delta=.02,maximum_error_increase=.005,maximum_p95_increase_ms=20.) is True
assert can_promote(b,Metrics(.81,.010,150.),minimum_quality_delta=.02,maximum_error_increase=.005,maximum_p95_increase_ms=20.) is False
assert can_promote(b,Metrics(.90,.010,200.),minimum_quality_delta=.02,maximum_error_increase=.005,maximum_p95_increase_ms=20.) is False
assert can_promote(b,Metrics(.85,.020,155.),minimum_quality_delta=.02,maximum_error_increase=.005,maximum_p95_increase_ms=20.) is False
print("✓ all three gates enforced")
print("\n+500 XP — Canary Gate. Boss fight won. 🏆")
