scores=fuse((["a","b"],["b","c"],["b","b"]))
assert scores["b"]>scores["a"] and scores["b"]>scores["c"]
s2=fuse((["x","x"],))
assert abs(s2["x"]-1/61)<1e-9,"duplicate only counted once"
s3=fuse((["p"],["p"],["q"]))
assert s3["p"]>s3["q"]
print(f"✓ RRF: b>{scores['a']:.3f} a")
print("\n+200 XP — Rank Fusion complete.")
