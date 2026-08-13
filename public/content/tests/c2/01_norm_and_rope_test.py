import numpy as np
x=np.array([[3.,4.],[1.,-1.]]); w=np.ones(2)
normed=rms_norm(x,w)
assert normed.shape==x.shape
assert np.allclose(np.mean(normed**2,axis=-1),np.ones(2),atol=1e-5),"rms_norm: mean(x^2)!=1"
r=rotate_half(np.array([[1.,2.,3.,4.]]))
assert np.array_equal(r,np.array([[-2.,1.,-4.,3.]])),f"rotate_half wrong: {r}"
print("✓ RMSNorm normalises correctly")
print("✓ rotate_half correct")
print("\n+150 XP — RMSNorm & RoPE complete.")
