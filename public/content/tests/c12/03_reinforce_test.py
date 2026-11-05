import numpy as np
assert np.allclose(discounted_returns([1,0,2], .5), [1.5,1,2])
assert np.allclose(discounted_returns([1,2], 0), [1,2])
assert len(discounted_returns([], 1)) == 0
lp = np.log(np.array([[.5,.25,.75],[.8,.2,.9]]))
r = np.array([[1.,0.,2.],[3.,999.,999.]])
m = np.array([[1,1,1],[1,0,0]], bool)
expected = -(np.dot(lp[0], np.array([1.5,.5,.5])) + lp[1,0]*3)/2
assert np.isclose(reinforce_loss(lp,r,m,.5), expected), 'Episode weighting and discount factors'
changed = lp.copy(); changed[~m] = -999
assert np.isclose(reinforce_loss(changed,r,m,.5), expected)
print('REINFORCE checks passed.')
