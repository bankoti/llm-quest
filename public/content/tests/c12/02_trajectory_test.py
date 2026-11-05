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
assert np.isfinite(trajectory_score(np.array([[1000.]]), np.array([0]), np.ones(1), 0)[0])
empty = trajectory_score(np.empty((0,2)), np.array([]), w, b)
assert empty[0] == 0 and np.allclose(empty[1], 0)
print('Trajectory-score checks passed.')
