import numpy as np
rng = np.random.default_rng(708)
for shape in [(2, 3, 5), (1, 4, 2), (3, 1, 7)]:
    z = rng.normal(size=shape) * 9 + 10000
    y = rng.integers(shape[-1], size=shape[:-1])
    m = rng.random(shape[:-1]) > .3
    m.flat[0] = True
    before = z.copy()
    terms = []
    for b, t in zip(*np.where(m)):
        row = z[b, t] - z[b, t].max()
        terms.append(-np.log(np.exp(row[y[b, t]]) / np.exp(row).sum()))
    total, count = loss_totals(z, y, m)
    assert np.isclose(total, sum(terms)) and count == len(terms), 'Score only valid targets'
    assert np.array_equal(z, before)
g = np.array([3., 4.])
assert np.allclose(clip_gradient(g, 2), [1.2, 1.6]), 'Clip global norm, not coordinates'
assert np.array_equal(g, [3, 4])
assert np.allclose(clip_gradient(np.zeros((2, 2)), 1), 0)
assert np.allclose(clip_gradient(g, 10), g)
assert np.allclose([learning_rate(i, 6, 2, 1, .1) for i in range(6)], [.5, 1, 1, .775, .325, .1])
assert learning_rate(0, 1, 0, 1, .2) == .2
for thunk in [lambda: loss_totals(np.zeros((1, 2, 3)), np.zeros((1, 2), int), np.zeros((1, 2), bool)), lambda: clip_gradient(g, 0), lambda: learning_rate(6, 6, 2, 1)]:
    try:
        thunk()
    except ValueError:
        pass
    else:
        raise AssertionError('Invalid inputs must fail explicitly')
print('Training-accounting checks passed.')
