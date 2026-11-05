import numpy as np
x, y = np.array([-2., 0., 1.]), np.array([1., -.2, .7])
first, second = [-1., .2], [-3., .5, 2.]
expected = [[sum((b*np.tanh(a*xi)-yi)**2 for xi, yi in zip(x, y))/len(x) for b in second] for a in first]
assert np.allclose(landscape(x, y, first, second), expected)
for dtype, value, weight in [(np.int8, 2, 64), (np.uint8, 16, 16)]:
    operands = [np.array([values], dtype=dtype) for values in (value, 1, weight, 1)]
    before = [values.copy() for values in operands]
    np.testing.assert_allclose(landscape(*operands), [[0.]], atol=1e-12)
    assert all(np.array_equal(values, saved) for values, saved in zip(operands, before))
theta = np.array([2., -3.])
assert np.allclose(numerical_gradient(lambda z: z[0]**2+3*z[1]**2+z[0]*z[1], theta), [1., -16.], atol=1e-6)
assert np.array_equal(theta, [2, -3])
print('Landscape checks passed.')
