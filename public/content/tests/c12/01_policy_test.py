import numpy as np
result = imitation_l1(np.array([[2., -1.]]), np.array([1]), np.zeros(2), 0.)
assert result['loss'] == .5 and np.allclose(result['grad_w'], [-.5, .25]) and result['grad_b'] == -.25
rng = np.random.default_rng(17)
x, y, w = rng.normal(size=(7, 3)), rng.integers(2, size=7), rng.normal(size=3)
b = .3; got = imitation_l1(x, y, w, b)
def loss(weight, bias):
    p = 1/(1+np.exp(-(x@weight+bias)))
    return np.abs(p-y).mean()
eps = 1e-5
for i in range(3):
    delta = np.eye(3)[i]*eps
    assert np.isclose(got['grad_w'][i], (loss(w+delta,b)-loss(w-delta,b))/(2*eps))
assert np.isclose(got['grad_b'], (loss(w,b+eps)-loss(w,b-eps))/(2*eps))
assert np.isfinite(imitation_l1(np.array([[1000.], [-1000.]]), np.array([0, 1]), np.ones(1), 0.)['loss'])
print('Sigmoid imitation checks passed.')
