assert assign("user-1")==assign("user-1")
buckets={assign(f"user-{i}") for i in range(20)}
assert "control" in buckets and "treatment" in buckets
rows=[("control",False),("control",True),("treatment",True),("treatment",True)]
assert lift(rows)==.5,f"lift={lift(rows)}"
assert lift([("control",True),("control",True),("treatment",True),("treatment",True)])==0.
print("✓ stable assignment")
print("✓ both buckets exist")
print("✓ lift correct")
print("\n+200 XP — Experiment Design complete.")
