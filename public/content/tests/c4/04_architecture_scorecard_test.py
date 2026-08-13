patterns=[
    Pattern("head-cache",20,.01,.82),Pattern("live-model",180,.50,.91),
    Pattern("teacher-student",45,.05,.87),Pattern("lexical",10,.001,.68),
]
ranked=rank_patterns(patterns,latency_slo_ms=100,cost_slo=.10)
assert "live-model" not in ranked
assert ranked[0]=="teacher-student",f"got {ranked}"
print(f"✓ ranked (100ms SLO): {ranked}")
print("\n+150 XP — Architecture Scorecard complete.")
