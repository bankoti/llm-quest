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
for dtype, row, position in [(np.uint8, [200, 1, 100], [100, 0, 0]),
                             (np.int8, [100, 1, -20], [100, 0, 0])]:
    ids = np.array([[0]], dtype=np.int64)
    embedding = np.array([row, [0, 10, 0]], dtype=dtype)
    positions = np.array([position], dtype=dtype)
    before = [value.copy() for value in (ids, embedding, positions)]
    result = decoder_logits(ids, embedding, positions, [], 1)
    expected = _independent_decoder(ids, embedding.astype(float), positions.astype(float), [], 1)
    assert np.allclose(result, expected), 'Add numeric embeddings in floating point before normalization'
    assert np.issubdtype(result.dtype, np.floating)
    assert all(np.array_equal(value, original) for value, original in zip((ids, embedding, positions), before))
ids, embedding, positions = np.array([[0]]), np.array([[1., -1.]]), np.zeros((1, 2))
zero_block = {**{name: np.zeros((2, 2)) for name in ('q', 'k', 'v', 'o')}, 'up': np.zeros((2, 1)), 'down': np.zeros((1, 2))}
expected = _independent_decoder(ids, embedding, positions, [zero_block], 1)
negative_block = {**zero_block, 'up': np.array([[-1e308], [1e308]])}
before = {name: value.copy() for name, value in negative_block.items()}
with np.errstate(over='raise', invalid='raise'):
    result = decoder_logits(ids, embedding, positions, [negative_block], 1)
    np.testing.assert_allclose(result, expected)
    assert np.isfinite(result).all()
    for block in [
        {**zero_block, 'up': -negative_block['up']},
        {**zero_block, 'q': np.eye(2)*1e308, 'k': np.eye(2)*1e308},
    ]:
        try:
            decoder_logits(ids, embedding, positions, [block], 1)
        except FloatingPointError:
            pass
        else:
            raise AssertionError('Nonrepresentable active decoder intermediates must fail explicitly')
assert all(np.array_equal(value, before[name]) for name, value in negative_block.items())
with np.errstate(over='raise', invalid='raise'):
    huge_embedding = np.array([[1e200, -1e200]])
    result = decoder_logits(ids, huge_embedding, positions, [], 1)
    np.testing.assert_allclose(result, [[[2e200]]])
    assert np.array_equal(huge_embedding, [[1e200, -1e200]])
common = 3*2**53
ids, embedding = np.array([[0]]), np.array([[0., 0.], [1., 1.]])
positions = np.array([[common, common-8]], dtype=float)
before = [value.copy() for value in (ids, embedding, positions)]
np.testing.assert_allclose(decoder_logits(ids, embedding, positions, [], 1), [[[0., 0.]]], rtol=0., atol=0.)
assert all(np.array_equal(value, original) for value, original in zip((ids, embedding, positions), before))
embedding = np.vstack([np.zeros((1, 4)), np.ones((1, 4)), np.eye(4)])
base_positions = np.array([[0., -8., -4., 4.]])
expected = _independent_decoder(ids, embedding, base_positions, [], 1)
for offset in [0., float(common), -float(common)]:
    positions = base_positions+offset
    before = positions.copy()
    result = decoder_logits(ids, embedding, positions, [], 1)
    np.testing.assert_allclose(result, expected, rtol=1e-14, atol=1e-15)
    assert abs(result[0, 0, 1]) < 1e-15
    assert np.array_equal(positions, before)
embedding = np.vstack([np.zeros((1, 2)), np.ones((1, 2)), np.eye(2)])
with np.errstate(over='raise', invalid='raise'):
    positions = np.array([[1e308, -1e308]])
    np.testing.assert_allclose(decoder_logits(ids, embedding, positions, [], 1), [[[0., 0., 1., -1.]]], rtol=1e-14, atol=0.)
    positions = np.array([[1e308, 1e308]])
    np.testing.assert_allclose(decoder_logits(ids, embedding, positions, [], 1), np.zeros((1, 1, 4)), rtol=0., atol=0.)
print('Complete decoder checks passed.')
