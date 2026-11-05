import numpy as np
result = imitation_l1(np.array([[2., -1.]]), np.array([1]), np.zeros(2), 0.)
assert result['loss'] == .5 and np.allclose(result['grad_w'], [-.5, .25]) and result['grad_b'] == -.25
unsigned_actions = imitation_l1(np.array([[2., -1.]]), np.array([1], dtype=np.uint8), np.zeros(2), 0.)
assert np.array_equal(unsigned_actions['probabilities'], [.5])
assert unsigned_actions['loss'] == .5 and np.array_equal(unsigned_actions['grad_w'], [-.5, .25]) and unsigned_actions['grad_b'] == -.25, 'Unsigned binary actions must have a negative imitation slope'
for states, actions, weights, bias in [
    (np.array([[200]], dtype=np.uint8), np.array([1], dtype=np.uint8), np.array([2], dtype=np.uint8), np.int16(-400)),
    (np.array([[100, 100]], dtype=np.int8), np.array([0], dtype=np.uint8), np.array([2, -1], dtype=np.int8), np.int16(-100)),
    (np.array([[-100]], dtype=np.int8), np.array([1], dtype=np.int8), np.array([2], dtype=np.int8), np.int16(200)),
]:
    before = [value.copy() for value in (states, actions, weights)]
    result = imitation_l1(states, actions, weights, bias)
    slope = .25 if actions[0] == 0 else -.25
    assert np.array_equal(result['probabilities'], [.5]) and result['loss'] == .5
    assert np.array_equal(result['grad_w'], states.astype(float)[0] * slope) and result['grad_b'] == slope, 'Promote integer operands before matmul and signed cancellation'
    assert result['probabilities'].dtype.kind == 'f' and result['grad_w'].dtype.kind == 'f'
    assert isinstance(result['loss'], float) and isinstance(result['grad_b'], float)
    assert all(np.array_equal(value, original) for value, original in zip((states, actions, weights), before))
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
