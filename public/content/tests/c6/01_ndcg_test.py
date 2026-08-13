import math
assert ndcg(["a","x"],["a"],2)==1.0
assert 0.<ndcg(["x","a"],["a"],2)<1.
assert ndcg(["x","y"],["a","b"],2)==0.
print("✓ NDCG correct")
print("\n+150 XP — NDCG complete.")
