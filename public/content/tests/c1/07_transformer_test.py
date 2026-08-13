import numpy as np
np.random.seed(7)
B,T,C,H = 2,6,16,4; D=C//H; s=0.05
x=np.random.randn(B,T,C)
Wq=np.random.randn(C,C)*s; Wk=np.random.randn(C,C)*s
Wv=np.random.randn(C,C)*s; Wo=np.random.randn(C,C)*s
W1=np.random.randn(C,4*C)*s; W2=np.random.randn(4*C,C)*s

Q=np.random.randn(B,T,D); K=np.random.randn(B,T,D); V=np.random.randn(B,T,D)
out=causal_attention(Q,K,V)
assert out.shape==(B,T,D), f"attn shape: {out.shape}"
V2=V.copy(); V2[:,-1]+=100
out2=causal_attention(Q,K,V2)
assert np.allclose(out[:,:-1],out2[:,:-1],atol=1e-5), "causality violated"

blk=transformer_block(x,Wq,Wk,Wv,Wo,W1,W2,H)
assert blk.shape==(B,T,C), f"block shape: {blk.shape}"
x2=x.copy(); x2[:,-1]+=10
blk2=transformer_block(x2,Wq,Wk,Wv,Wo,W1,W2,H)
assert np.allclose(blk[:,:-1],blk2[:,:-1],atol=1e-4), "block causality violated"
print("✓ causal_attention correct")
print("✓ transformer_block correct")
print("\n+500 XP — THE TRANSFORMER. Boss fight won. 🏆")
