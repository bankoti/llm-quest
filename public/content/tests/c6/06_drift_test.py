import math
ref=[.25,.25,.25,.25]
assert abs(population_stability_index(ref,ref))<1e-9
cur=[.10,.30,.40,.20]
psi=population_stability_index(ref,cur)
assert psi>0
large=[.01,.01,.01,.97]
big=population_stability_index(ref,large)
assert big>psi and big>.25
assert abs(chi_squared_distance(ref,ref))<1e-9
assert chi_squared_distance(ref,cur)>0
print(f"✓ PSI no-drift=0 moderate={psi:.3f} significant={big:.3f}")
print("\n+500 XP — Drift Detection. Boss fight won. 🏆")
