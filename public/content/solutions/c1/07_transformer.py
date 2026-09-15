import numpy as np

def layer_norm(x, eps=1e-5):
    return (x - x.mean(axis=-1, keepdims=True)) / np.sqrt(x.var(axis=-1, keepdims=True) + eps)

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def causal_attention(Q, K, V):
    scores = Q @ K.swapaxes(-1, -2) / np.sqrt(Q.shape[-1])
    scores = np.where(np.tri(Q.shape[-2], dtype=bool), scores, -np.inf)
    return softmax(scores) @ V

def multihead_attention(x, Wq, Wk, Wv, Wo, n_heads):
    b, t, c = x.shape
    def split(w):
        return (x @ w).reshape(b, t, n_heads, c // n_heads).transpose(0, 2, 1, 3)
    out = causal_attention(split(Wq), split(Wk), split(Wv))
    return out.transpose(0, 2, 1, 3).reshape(b, t, c) @ Wo

def feed_forward(x, W1, W2):
    h = x @ W1
    return (h / (1 + np.exp(-1.702 * h))) @ W2

def transformer_block(x, Wq, Wk, Wv, Wo, W1, W2, n_heads):
    x = x + multihead_attention(layer_norm(x), Wq, Wk, Wv, Wo, n_heads)
    return x + feed_forward(layer_norm(x), W1, W2)
