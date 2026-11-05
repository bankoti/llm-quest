import numpy as np
assert np.allclose(ridge_fit(np.array([[1., 1.]]), np.array([[2.]])), [[1], [1]])
rng = np.random.default_rng(9)
for n, d in [(9, 4), (4, 9), (5, 5)]:
    x, y = rng.normal(size=(n, d)), rng.normal(size=(n, 2))
    for penalty in [0., .3, 4.]:
        w = ridge_fit(x, y, penalty)
        assert np.allclose((x.T@x+penalty*np.eye(d))@w, x.T@y, atol=1e-7)
result = bias_variance(np.array([[1., 4.], [3., 2.]]), np.array([1., 2.]))
assert result == dict(bias2=1., variance=1., mse=2.)
for predictions, truth, expected in [
    (np.array([[200], [200]], dtype=np.uint8), np.array([0], dtype=np.uint8), dict(bias2=40000., variance=0., mse=40000.)),
    (np.array([[0], [0]], dtype=np.uint8), np.array([200], dtype=np.uint8), dict(bias2=40000., variance=0., mse=40000.)),
    (np.array([[-100], [100]], dtype=np.int8), np.array([100], dtype=np.int8), dict(bias2=10000., variance=10000., mse=20000.)),
    (np.array([[100], [100]], dtype=np.int8), np.array([-100], dtype=np.int8), dict(bias2=40000., variance=0., mse=40000.)),
]:
    before_predictions, before_truth = predictions.copy(), truth.copy()
    result = bias_variance(predictions, truth)
    assert result == expected, 'Promote integer inputs before subtraction and squaring'
    assert all(isinstance(value, float) for value in result.values())
    assert result['mse'] == result['bias2'] + result['variance']
    assert np.array_equal(predictions, before_predictions) and np.array_equal(truth, before_truth)
print('Interpolation checks passed.')
