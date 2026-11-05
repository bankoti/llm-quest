import numpy as np
assert path_counts(0) == [1]
assert path_counts(5) == [1, 5, 10, 10, 5, 1]
assert sum(path_counts(20)) == 2**20
x = np.array([1., 2.]); a = np.array([[1., 2.], [0., 1.]]); b = np.array([[2., 0.], [3., 1.]])
assert np.allclose(linear_chain(x, [a, b]), x+a@x+b@x+b@a@x), 'Preserve matrix order'
assert np.allclose(linear_chain(x, [a, b], False), b@a@x)
y = linear_chain(x, []); y[:] = 0
assert np.array_equal(x, [1, 2])
try:
    path_counts(-1)
except ValueError:
    pass
else:
    raise AssertionError('Reject negative depth')
print('Residual-path checks passed.')
