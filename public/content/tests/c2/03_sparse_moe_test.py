import numpy as np
outs=np.array([[[1.,0.],[0.,2.],[9.,9.]],[[2.,2.],[4.,4.],[8.,8.]]])
logits=np.array([[2.,1.,-10.],[-10.,0.,0.]])
comb=route(outs,logits,k=2)
assert comb.shape==(2,2),f"shape: {comb.shape}"
assert np.all(comb[0]<np.array([1.01,2.01])),"expert 2 (logit -10) must be excluded"
assert np.allclose(comb[1],[6.,6.],atol=1e-5),f"equal-weight mix=[6,6], got {comb[1]}"
print("✓ shape correct")
print("✓ inactive expert excluded")
print("✓ equal-weight routing correct")
print("\n+200 XP — Sparse MoE complete.")
