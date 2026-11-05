import numpy as np

def _independent_decoder(ids, e, p, blocks, heads):
    def norm(v):
        return (v - np.mean(v)) / np.sqrt(np.mean((v - np.mean(v))**2) + 1e-5)
    outputs = []
    d = e.shape[1] // heads
    for row in ids:
        x = e[row] + p[:len(row)]
        for block in blocks:
            n = np.stack([norm(token) for token in x])
            q, k, v = [n @ block[name] for name in ('q', 'k', 'v')]
            contexts = []
            for t in range(len(row)):
                pieces = []
                for head in range(heads):
                    sl = slice(head*d, (head+1)*d)
                    scores = np.array([np.dot(q[t, sl], k[j, sl]) / np.sqrt(d) for j in range(t+1)])
                    probs = np.exp(scores-scores.max()); probs /= probs.sum()
                    pieces.append(sum(probs[j]*v[j, sl] for j in range(t+1)))
                contexts.append(np.concatenate(pieces))
            x = x + np.stack(contexts) @ block['o']
            h = np.stack([norm(token) for token in x]) @ block['up']
            x = x + (h / (1+np.exp(-1.702*h))) @ block['down']
        outputs.append(np.stack([norm(token) for token in x]) @ e.T)
    return np.stack(outputs)

rng = np.random.default_rng(281)
for width, heads, depth in [(4, 1, 0), (8, 2, 1), (6, 3, 2)]:
    ids = rng.integers(11, size=(2, 5))
    e, p = rng.normal(size=(11, width)), rng.normal(size=(7, width))
    blocks = [{**{name: rng.normal(size=(width, width))*.2 for name in ('q', 'k', 'v', 'o')}, 'up': rng.normal(size=(width, 9))*.2, 'down': rng.normal(size=(9, width))*.2} for _ in range(depth)]
    before = e.copy()
    result = decoder_logits(ids, e, p, blocks, heads)
    assert np.allclose(result, _independent_decoder(ids, e, p, blocks, heads), atol=1e-8), 'Full forward numerical contract'
    altered = ids.copy(); altered[:, -1] = (altered[:, -1]+1) % 11
    assert np.allclose(result[:, :-1], decoder_logits(altered, e, p, blocks, heads)[:, :-1]), 'No future information'
    assert np.allclose(result[:, :3], decoder_logits(ids[:, :3], e, p, blocks, heads)), 'Prefix invariance'
    assert np.array_equal(e, before)
print('Complete decoder checks passed.')
