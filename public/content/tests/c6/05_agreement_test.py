assert cohen_kappa([0,0,1,1],[0,0,1,1])==1.
assert cohen_kappa([0,0,1,1],[0,1,0,1])==0.
k=cohen_kappa([0,0,1,1,0],[0,1,1,1,0])
assert 0.<k<1.
assert cohen_kappa([0,1,0,1],[1,1,0,0])==cohen_kappa([1,1,0,0],[0,1,0,1])
print(f"✓ perfect=1 chance=0 partial={k:.3f}")
print("\n+150 XP — Inter-Rater Agreement complete.")
