b=Metrics(.80,.010,150.)
G=dict(minimum_quality_delta=.02,maximum_error_increase=.005,maximum_p95_increase_ms=20.)
assert can_promote(b,Metrics(.83,.012,160.),**G) is True
assert can_promote(b,Metrics(.81,.010,150.),**G) is False
assert can_promote(b,Metrics(.90,.010,200.),**G) is False
assert can_promote(b,Metrics(.85,.020,155.),**G) is False
print("✓ all three gates enforced")

D=dict(**G,min_samples=1000)
assert decide(b,Metrics(.85,.020,155.),samples=120,**D)=="rollback"
assert decide(b,Metrics(.90,.010,200.),samples=5000,**D)=="rollback"
assert decide(b,Metrics(.83,.012,160.),samples=120,**D)=="hold"
assert decide(b,Metrics(.83,.012,160.),samples=5000,**D)=="promote"
assert decide(b,Metrics(.81,.010,150.),samples=5000,**D)=="hold"
print("✓ promote/hold/rollback decisions correct")

assert next_ramp(1,"promote")==5
assert next_ramp(25,"promote")==50
assert next_ramp(100,"promote")==100
assert next_ramp(50,"hold")==50
assert next_ramp(25,"rollback")==0
pct=1
for _ in range(4): pct=next_ramp(pct,"promote")
assert pct==100
print("✓ ramp walks 1 -> 5 -> 25 -> 50 -> 100")

print("\n+500 XP — Canary Gate. Boss fight won. 🏆")
