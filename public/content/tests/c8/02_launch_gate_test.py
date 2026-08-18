assert gate_status(0.83, 0.80, True)
assert not gate_status(0.78, 0.80, True)
assert gate_status(180., 200., False)
assert not gate_status(240., 200., False), \
    "p95 of 240ms against a 200ms ceiling just passed. Lower is better for latency — check the direction flag."
evidence={
    "quality":(0.83,0.80,True),
    "latency_p95":(240.,200.,False),
    "fallback_success":(0.999,0.995,True),
    "security_scan":(0.,0.,False),
    "cost_per_1k":(0.9,1.0,False),
    "rollback_drill_minutes":(8.,15.,False),
}
gates=evaluate_gates(evidence)
assert gates["quality"] and not gates["latency_p95"]
assert not can_launch(gates), "five of six gates pass — the launch is still blocked"
assert blocking_gates(gates)==["latency_p95"]
passing={g:True for g in evidence}
assert can_launch(passing)
for g in passing:
    assert not can_launch({**passing,g:False}), f"gate {g!r} must block"
assert blocking_gates(passing)==[]
print("\u2713 evidence -> gates -> verdict, with the blocking gate named")
print("\n+200 XP \u2014 Launch Gate complete.")
