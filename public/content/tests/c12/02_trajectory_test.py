import numpy as np
x = np.array([[1., 2.], [-1., 3.], [2., 0.]])
a, w, b = np.array([1, 0, 1]), np.array([.2, -.4]), .1
lp, gw, gb = trajectory_score(x, a, w, b)
p = 1/(1+np.exp(-(x@w+b)))
assert np.isclose(np.exp(lp), np.prod(np.where(a, p, 1-p)))
eps = 1e-5
for i in range(2):
    d = np.eye(2)[i]*eps
    assert np.isclose(gw[i], (trajectory_score(x,a,w+d,b)[0]-trajectory_score(x,a,w-d,b)[0])/(2*eps))
assert np.isclose(gb, (trajectory_score(x,a,w,b+eps)[0]-trajectory_score(x,a,w,b-eps)[0])/(2*eps))
for states, actions, weights, bias in [
    (np.array([[200]], dtype=np.uint8), np.array([1], dtype=np.uint8), np.array([2], dtype=np.uint8), np.int16(-400)),
    (np.array([[100, 100]], dtype=np.int8), np.array([0], dtype=np.uint8), np.array([2, -1], dtype=np.int8), np.int16(-100)),
    (np.array([[-100]], dtype=np.int8), np.array([1], dtype=np.int8), np.array([2], dtype=np.int8), np.int16(200)),
]:
    before = [value.copy() for value in (states, actions, weights)]
    log_probability, gradient, bias_gradient = trajectory_score(states, actions, weights, bias)
    score = float(actions[0]) - .5
    assert np.isclose(log_probability, -np.log(2.))
    assert np.array_equal(gradient, states.astype(float)[0] * score) and bias_gradient == score, 'Promote integer operands before matmul and signed cancellation'
    assert gradient.dtype.kind == 'f' and isinstance(log_probability, float) and isinstance(bias_gradient, float)
    assert all(np.array_equal(value, original) for value, original in zip((states, actions, weights), before))
assert np.isfinite(trajectory_score(np.array([[1000.]]), np.array([0]), np.ones(1), 0)[0])
empty = trajectory_score(np.empty((0,2)), np.array([]), w, b)
assert empty[0] == 0 and np.allclose(empty[1], 0)
print('Trajectory-score checks passed.')
