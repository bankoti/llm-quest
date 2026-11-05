import numpy as np
assert paired_success([0,0],[1,1]) == dict(difference=1.,lower=1.,upper=1.)
assert paired_success([0,1,1,0],[0,1,1,0]) == dict(difference=0.,lower=0.,upper=0.)
a,b=np.array([1,0,1,0]),np.array([1,1,1,0])
result=paired_success(a,b,seed=12,resamples=400)
rng=np.random.default_rng(12)
draws=np.array([np.mean((b-a)[rng.integers(4,size=4)]) for _ in range(400)])
assert result['difference']==.25 and np.allclose([result['lower'],result['upper']],np.quantile(draws,[.025,.975]))
try:
    paired_success([],[])
except ValueError:
    pass
else:
    raise AssertionError('Reject empty evidence')
print('Paired-evidence checks passed.')
