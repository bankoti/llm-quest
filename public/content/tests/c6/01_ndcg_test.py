import math
assert ndcg(["a","x"],["a"],2)==1.0
assert 0.<ndcg(["x","a"],["a"],2)<1.
assert ndcg(["x","y"],["a","b"],2)==0.
better=ndcg(["a","b","x"],["a","b"],3); worse=ndcg(["x","a","b"],["a","b"],3)
assert better==1.0 and worse<better, \
    "Same three documents, different order. If these score the same, there is no position discount and the metric is just recall."
traced=ndcg(["d1","d2","d3"],["d2","d3"],3)
assert abs(traced-0.6934)<1e-3, f"the lesson hand trace: expected ~0.693, got {traced:.4f}"
assert ndcg(["a"],["a"],0)==0., "k=0 must return 0, not divide by zero"
assert ndcg([],["a"],5)==0., "empty ranking scores 0"
print("✓ NDCG matches the hand trace; position discount verified")
print("\n+150 XP — NDCG complete.")
