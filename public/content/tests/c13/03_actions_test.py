import numpy as np
mask = block_mask([2,1,3])
ids = [0,0,1,2,2,2]
assert np.array_equal(mask,[[j<=i for j in ids] for i in ids])
assert mask[3,5] and not mask[0,3], 'Action block bidirectional; prefix cannot see actions'
noise,actions = np.array([-1.,2.]),np.array([3.,0.])
x,v = flow_target(noise,actions,.25)
assert np.allclose(x,[0,1.5]) and np.allclose(v,[4,-2])
assert np.allclose(flow_target(noise,actions,0)[0],noise)
assert np.allclose(flow_target(noise,actions,1)[0],actions)
assert np.array_equal(noise,[-1,2])
print('VLA mask and flow checks passed.')
