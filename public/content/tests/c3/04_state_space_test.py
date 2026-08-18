import numpy as np
np.random.seed(11); T,W,S=6,4,3
A=np.random.randn(S,S)*0.1; B=np.random.randn(S,W)*0.1; C=np.random.randn(W,S)*0.1
x=np.random.randn(T,W)
h1,y1=ssm_step(x[0],np.zeros(S),A,B,C)
assert h1.shape==(S,); assert y1.shape==(W,)
# value correctness: verify y1 against inline reference
_h = A @ np.zeros(S) + B @ x[0]
_y_ref = C @ _h
assert np.allclose(y1, _y_ref, atol=1e-10), f"ssm_step output wrong: got {y1}, expected {_y_ref}"
outs=ssm_scan(x,A,B,C)
assert outs.shape==(T,W)
assert not np.allclose(outs, 0), "ssm_scan outputs are all zero — check recurrence implementation"
x2=x.copy(); x2[4:]+=100
out2=ssm_scan(x2,A,B,C)
assert np.allclose(outs[:4],out2[:4],atol=1e-10),"SSM must be causal"
print("✓ ssm_step shapes correct")
print("✓ ssm_step value correct")
print("✓ ssm_scan causal and non-trivial")
print("\n+200 XP — State Space Models complete.")
