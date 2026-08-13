import numpy as np
np.random.seed(11); T,W,S=6,4,3
A=np.random.randn(S,S)*0.1; B=np.random.randn(S,W)*0.1; C=np.random.randn(W,S)*0.1
x=np.random.randn(T,W)
h1,y1=ssm_step(x[0],np.zeros(S),A,B,C)
assert h1.shape==(S,); assert y1.shape==(W,)
outs=ssm_scan(x,A,B,C)
assert outs.shape==(T,W)
x2=x.copy(); x2[4:]+=100
out2=ssm_scan(x2,A,B,C)
assert np.allclose(outs[:4],out2[:4],atol=1e-10),"SSM must be causal"
print("✓ ssm_step shapes correct")
print("✓ ssm_scan causal")
print("\n+200 XP — State Space Models complete.")
