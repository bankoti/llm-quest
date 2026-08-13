import numpy as np
np.random.seed(0)
T,D=6,4
Q=np.random.randn(T,D); K=np.random.randn(T,D); V=np.random.randn(T,D)
out1=causal_attention(Q,K,V)
K2=K.copy(); V2=V.copy(); K2[3:]=np.random.randn(3,D); V2[3:]=np.random.randn(3,D)
out2=causal_attention(Q,K2,V2)
assert np.allclose(out1[:3],out2[:3],atol=1e-9), "Changing FUTURE tokens changed past outputs — position t can see the future. How exactly does the mask remove a position from the softmax?"
def _ref(Q,K,V):
    T,D=Q.shape
    s=Q@K.T/np.sqrt(D)
    s=np.where(np.tril(np.ones((T,T),dtype=bool)),s,-np.inf)
    e=np.exp(s-s.max(axis=-1,keepdims=True)); w=e/e.sum(axis=-1,keepdims=True)
    return w@V
assert np.allclose(causal_attention(Q,K,V),_ref(Q,K,V),atol=1e-8), "Causality holds but the attention weights are still wrong."
print("✓ causality holds, weights correct")
print("\n+150 XP — Leaky Attention debugged.")
