import numpy as np
x, y = np.array([-2., 0., 1.]), np.array([1., -.2, .7])
first, second = [-1., .2], [-3., .5, 2.]
expected = [[sum((b*np.tanh(a*xi)-yi)**2 for xi, yi in zip(x, y))/len(x) for b in second] for a in first]
assert np.allclose(landscape(x, y, first, second), expected)
theta = np.array([2., -3.])
assert np.allclose(numerical_gradient(lambda z: z[0]**2+3*z[1]**2+z[0]*z[1], theta), [1., -16.], atol=1e-6)
assert np.array_equal(theta, [2, -3])
print('Landscape checks passed.')
