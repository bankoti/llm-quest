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
for magnitude, limit in [(1e200, 1.), (1e308, 1.), (1e-200, 1e-201)]:
    gradient = np.array([[magnitude, -magnitude], [0., 0.]])
    before = gradient.copy()
    clipped = clip_gradient(gradient, limit)
    expected = np.array([[1., -1.], [0., 0.]]) * (limit / np.sqrt(2.))
    assert np.allclose(clipped, expected, rtol=1e-14, atol=0), 'Preserve direction across finite magnitude ranges'
    assert np.array_equal(gradient, before) and not np.shares_memory(clipped, gradient)
large = np.array([1e308, -1e308])
assert np.array_equal(clip_gradient(large, 1.5e308), large), 'Large representable norms below the limit must stay unchanged'
mixed = np.array([1e308, 1e-308])
assert np.allclose(clip_gradient(mixed, 5e307), [5e307, 5e-309], rtol=1e-14, atol=0), 'Retain small coordinates when their clipped values are representable'
empty = np.empty((0, 2))
assert clip_gradient(empty, 1).shape == empty.shape
assert np.allclose([learning_rate(i, 6, 2, 1, .1) for i in range(6)], [.5, 1, 1, .775, .325, .1])
assert learning_rate(0, 1, 0, 1, .2) == .2
assert learning_rate(1, 3, 2, 1e308) == 1e308, 'The final warmup update must reach the finite peak'
for peak in (1.,1e308,np.finfo(float).max):
    rates = np.array([learning_rate(step,5,4,peak) for step in range(4)])
    expected = peak*np.array([.25,.5,.75,1.])
    assert np.isfinite(rates).all() and np.allclose(rates,expected,rtol=1e-14,atol=0.)
for thunk in [lambda: loss_totals(np.zeros((1, 2, 3)), np.zeros((1, 2), int), np.zeros((1, 2), bool)), lambda: clip_gradient(g, 0), lambda: learning_rate(6, 6, 2, 1)]:
    try:
        thunk()
    except ValueError:
        pass
    else:
        raise AssertionError('Invalid inputs must fail explicitly')
print('Training-accounting checks passed.')
