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
for state, action in [(1e308, 1), (-1e308, 0)]:
    states, actions, weights = np.array([[state]]), np.array([action]), np.array([2.])
    before = [value.copy() for value in (states, actions, weights)]
    log_probability, gradient, bias_gradient = trajectory_score(states, actions, weights, 0.)
    assert log_probability == 0. and np.array_equal(gradient, [0.]) and bias_gradient == 0., 'Saturated matching actions must not multiply an unchosen infinite log probability by zero'
    assert all(np.array_equal(value, original) for value, original in zip((states, actions, weights), before))
for state, action in [(1e308, 0), (-1e308, 1)]:
    log_probability, gradient, bias_gradient = trajectory_score(np.array([[state]]), np.array([action]), np.ones(1), 0.)
    assert log_probability == -1e308 and np.array_equal(gradient, [-1e308])
    assert bias_gradient == (1. if action else -1.), 'Finite extreme logits retain representable opposing-action scores'
for states, actions, weights, bias in [
    (np.array([[1e308]]), np.array([0]), np.array([2.]), 0.),
    (np.array([[-1e308]]), np.array([1]), np.array([2.]), 0.),
    (np.zeros((2, 1)), np.ones(2), np.zeros(1), -1e308),
    (np.full((4, 1), 1e308), np.ones(4), np.zeros(1), 0.),
    (np.array([[0.]]), np.ones(1), np.array([np.inf]), 0.),
]:
    before = [value.copy() for value in (states, actions, weights)]
    try:
        trajectory_score(states, actions, weights, bias)
    except FloatingPointError:
        pass
    else:
        raise AssertionError('Nonrepresentable trajectory outputs and NaN logits must fail explicitly')
    assert all(np.array_equal(value, original) for value, original in zip((states, actions, weights), before))
empty = trajectory_score(np.empty((0,2)), np.array([]), w, b)
assert empty[0] == 0 and np.allclose(empty[1], 0) and empty[2] == 0
tail = np.exp(-40.)/(1+np.exp(-40.))
for sign in [1., -1.]:
    for action in [0, 1]:
        states, actions, weights = np.array([[1e18]]), np.array([action]), np.array([sign*4e-17])
        before = [value.copy() for value in (states, actions, weights)]
        log_probability, gradient, bias_gradient = trajectory_score(states, actions, weights, 0.)
        matching = action == int(sign > 0)
        expected_score = (1. if action else -1.)*(tail if matching else 1-tail)
        expected_log_probability = -np.log1p(np.exp(-40.)) if matching else -40.-np.log1p(np.exp(-40.))
        np.testing.assert_allclose(log_probability, expected_log_probability, rtol=1e-14, atol=0.)
        np.testing.assert_allclose(gradient, [1e18*expected_score], rtol=1e-14, atol=0.)
        np.testing.assert_allclose(bias_gradient, expected_score, rtol=1e-14, atol=0.)
        assert log_probability < 0 and gradient[0] != 0 and bias_gradient != 0
        assert all(np.array_equal(value, original) for value, original in zip((states, actions, weights), before))
print('Trajectory-score checks passed.')
