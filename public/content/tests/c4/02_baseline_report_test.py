assert abs(precision_at_k(["a","b","c"],["a","c"],3)-2/3)<1e-9
assert precision_at_k(["x","y","z"],["a","b"],2)==0.0
mp=mean_precision([(["a","b","c","d"],["a","c"]),(["x","a","b","c"],["a","b"])],k=2)
assert abs(mp-0.5)<1e-9,f"mean P@2={mp}"
head=[(["a","b"],["a","b"],"head"),(["c","d"],["c","d"],"head")]
tail=[(["x","y"],["q"],"tail"),(["z","w"],["r"],"tail")]
r=baseline_report(head+tail,k=2)
assert r["queries"]==4 and r["k"]==2
assert abs(r["mean_precision_at_k"]-0.5)<1e-9
assert r["slices"]["head"]==1.0 and r["slices"]["tail"]==0.0, \
    "The aggregate says 0.5 — mediocre but alive. The tail slice is at ZERO. A report that only shows the aggregate hides a dead slice."
assert r["worst_slice"]=="tail"
print("✓ aggregate looks healthy, tail slice is dead — the report exposes it")
print("\n+150 XP — Baseline Report complete.")
