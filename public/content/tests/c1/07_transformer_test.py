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

# Exercise helpers independently — can't be bypassed by inlining into transformer_block
ff_out = feed_forward(x, W1, W2)
assert ff_out.shape == (B, T, C), f"feed_forward shape: {ff_out.shape}"

mha_out = multihead_attention(x, Wq, Wk, Wv, Wo, H)
assert mha_out.shape == (B, T, C), f"multihead_attention shape: {mha_out.shape}"
x2_mha = x.copy(); x2_mha[:, -1] += 10
mha_out2 = multihead_attention(x2_mha, Wq, Wk, Wv, Wo, H)
assert np.allclose(mha_out[:, :-1], mha_out2[:, :-1], atol=1e-4), \
    "multihead_attention causality violated"

blk=transformer_block(x,Wq,Wk,Wv,Wo,W1,W2,H)
assert blk.shape==(B,T,C), f"block shape: {blk.shape}"
x2=x.copy(); x2[:,-1]+=10
blk2=transformer_block(x2,Wq,Wk,Wv,Wo,W1,W2,H)
assert np.allclose(blk[:,:-1],blk2[:,:-1],atol=1e-4), "block causality violated"
print("✓ causal_attention correct")
print("✓ transformer_block correct")
print("\n+500 XP — THE TRANSFORMER. Boss fight won. 🏆")
