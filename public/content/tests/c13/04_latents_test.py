import numpy as np
p = np.array([[[1.,3.],[100.,100.]],[[2.,4.],[5.,7.]]])
t = np.zeros_like(p);m = np.array([[1,0],[0,1]],bool)
assert latent_mse(p,t,m) == (1+9+25+49)/4
a,b = np.array([2.,4.]),np.array([6.,0.])
result = ema_target(a,b,.9)
assert np.allclose(result,[2.4,3.6])
result[:] = 0
assert np.array_equal(a,[2,4]) and np.array_equal(b,[6,0])
try:
    latent_mse(p,t,np.zeros_like(m))
except ValueError:
    pass
else:
    raise AssertionError('Reject empty latent targets')
print('Latent prediction checks passed.')
