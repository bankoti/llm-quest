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
print('Interpolation checks passed.')
