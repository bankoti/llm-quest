import numpy as np
got=top_k_indices(np.array([0.1,0.9,0.5,0.7]),2)
assert got==[1,3], f"Asked for the 2 BEST docs, got indices {got} — those are the scores 0.1 and 0.5. 'Consistently terrible' is a signature: which direction does argsort sort?"
got3=top_k_indices(np.array([5.,4.,3.,2.,1.]),3)
assert got3==[0,1,2], "Best-first ordering broke."
print("✓ top-k returns the best documents, best first")
print("\n+150 XP — Backwards Ranking debugged.")
