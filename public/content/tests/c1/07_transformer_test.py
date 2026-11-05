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

# Numerical references are independent of the learner's helpers. Shape and
# causality alone also accept an identity block or all-zero attention.
def _reference_attention(q, k, v):
    scores = q @ k.swapaxes(-1, -2) / np.sqrt(q.shape[-1])
    scores = np.where(np.tri(q.shape[-2], dtype=bool), scores, -np.inf)
    probabilities = np.exp(scores - scores.max(axis=-1, keepdims=True))
    probabilities /= probabilities.sum(axis=-1, keepdims=True)
    return probabilities @ v

def _reference_norm(a):
    return (a - a.mean(axis=-1, keepdims=True)) / np.sqrt(a.var(axis=-1, keepdims=True) + 1e-5)

def _reference_heads(a, wq, wk, wv, wo, heads):
    b, t, c = a.shape
    split = lambda w: (a @ w).reshape(b, t, heads, c // heads).transpose(0, 2, 1, 3)
    attended = _reference_attention(split(wq), split(wk), split(wv))
    return attended.transpose(0, 2, 1, 3).reshape(b, t, c) @ wo

def _reference_ff(a, w1, w2):
    z = a @ w1
    return (z / (1 + np.exp(-1.702 * z))) @ w2

for seed, shape, heads in [(23, (1, 1, 4), 1), (31, (2, 5, 12), 3), (47, (1, 3, 8), 2)]:
    rng = np.random.default_rng(seed)
    a = rng.normal(size=shape)
    original = a.copy()
    c = shape[-1]
    weights = [rng.normal(scale=0.2, size=(c, c)) for _ in range(4)]
    w1 = rng.normal(scale=0.2, size=(c, 3*c))
    w2 = rng.normal(scale=0.2, size=(3*c, c))
    q, k, v = [rng.normal(size=shape) for _ in range(3)]
    assert np.allclose(causal_attention(q,k,v), _reference_attention(q,k,v), atol=1e-7), "attention must use scaled QK scores and V"
    assert np.allclose(multihead_attention(a,*weights,heads), _reference_heads(a,*weights,heads), atol=1e-7), "head split/merge or output projection is incorrect"
    assert np.allclose(feed_forward(a,w1,w2), _reference_ff(a,w1,w2), atol=1e-7), "FFN must apply the documented GELU approximation"
    mid = a + _reference_heads(_reference_norm(a), *weights, heads)
    expected = mid + _reference_ff(_reference_norm(mid), w1, w2)
    actual = transformer_block(a,*weights,w1,w2,heads)
    assert np.allclose(actual,expected,atol=1e-7), "block must apply both pre-norm sublayers and both residual additions"
    assert np.array_equal(a,original), "block must not mutate its input"
    zero = np.zeros((c,c))
    assert np.allclose(transformer_block(a,zero,zero,zero,zero,w1,np.zeros_like(w2),heads),a), "zero sublayers must preserve the residual stream"
print("✓ causal_attention correct")
print("✓ transformer_block correct")
print("\n+500 XP — THE TRANSFORMER. Boss fight won. 🏆")
