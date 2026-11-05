import numpy as np
old = np.log(np.full((3, 3), .25))
ratios = np.array([[1.4,.7,1.], [1.4,.7,1.1], [1.1,.8,1.2]])
z = old+np.log(ratios); ref = np.log(np.full((3,3), .2))
r = np.array([0.,2.,5.]); m = np.array([[1,0,0],[1,1,1],[1,1,0]], bool)
adv = (r-r.mean())/(r.std()+1e-8)
per_response = []
for i in range(3):
    values = []
    for t in np.flatnonzero(m[i]):
        ratio = np.exp(z[i,t]-old[i,t]); delta = ref[i,t]-z[i,t]
        values.append(min(ratio*adv[i], max(.8,min(1.2,ratio))*adv[i])-.3*(np.exp(delta)-delta-1))
    per_response.append(np.mean(values))
got = clipped_grpo(z,old,ref,r,m,beta=.3)
assert np.isclose(got['loss'], -np.mean(per_response)), 'Signed clipping, reference KL, and response weighting'
assert np.allclose(got['advantages'], adv)
assert np.allclose(got['ratios'][m], ratios[m]) and np.all(got['ratios'][~m] == 0)
assert np.isclose(got['clip_fraction'], .5)
assert abs(clipped_grpo(old,old,old,np.ones(3),m)['loss']) < 1e-12
z2 = z.copy(); z2[~m] = 10000
assert np.isclose(clipped_grpo(z2,old,ref,r,m,beta=.3)['loss'], got['loss']), 'Never exponentiate padding'
try:
    clipped_grpo(z,old,ref,r,np.zeros_like(m))
except ValueError:
    pass
else:
    raise AssertionError('Reject empty responses')
print('Full clipped GRPO checks passed.')
