import numpy as np
np.random.seed(0)
T,D=6,4
Q=np.random.randn(T,D); K=np.random.randn(T,D); V=np.random.randn(T,D)
out1=causal_attention(Q,K,V)

# 1. Causality: changing future tokens must not affect past outputs
K2=K.copy(); V2=V.copy(); K2[3:]=np.random.randn(3,D); V2[3:]=np.random.randn(3,D)
out2=causal_attention(Q,K2,V2)
assert np.allclose(out1[:3],out2[:3],atol=1e-9), "Output at position t changed when only tokens after t were modified"

# 2. Output shape must match input shape
assert out1.shape == (T, D), f"Expected output shape {(T,D)}, got {out1.shape}"

# 3. Each row must be a valid convex combination of V rows (weights sum to 1, non-negative)
def _ref(Q,K,V):
    T,D=Q.shape
    s=Q@K.T/np.sqrt(D)
    s=np.where(np.tril(np.ones((T,T),dtype=bool)),s,-np.inf)
    e=np.exp(s-s.max(axis=-1,keepdims=True)); w=e/e.sum(axis=-1,keepdims=True)
    return w@V
ref_out = _ref(Q,K,V)
assert np.allclose(out1, ref_out, atol=1e-8), "Attention weights produce incorrect output values"

# 4. Position 0 should attend only to itself (single token visible)
Q1=np.random.randn(1,D); K1=np.random.randn(1,D); V1=np.random.randn(1,D)
single=causal_attention(Q1,K1,V1)
assert np.allclose(single[0], V1[0], atol=1e-8), "Single-token attention should return V unchanged"

print("✓ causality holds, weights correct")
print("\n+150 XP — Leaky Attention debugged.")
