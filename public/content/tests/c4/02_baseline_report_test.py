q1=(["a","b","c","d"],["a","c"])
q2=(["x","a","b","c"],["a","b"])
assert abs(precision_at_k(["a","b","c"],["a","c"],3)-2/3)<1e-9
assert precision_at_k(["x","y","z"],["a","b"],2)==0.0
mp=mean_precision([q1,q2],k=2)
assert abs(mp-0.5)<1e-9,f"mean P@2={mp}"
r=baseline_report([q1,q2],k=3)
assert r["queries"]==2 and r["k"]==3 and "mean_precision_at_k" in r
print("✓ precision@k correct")
print(f"✓ baseline_report: {r}")
print("\n+150 XP — Baseline Report complete.")
