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
extreme = np.zeros((2, 1))
valid = np.ones((2, 1), bool)
with np.errstate(over='raise', invalid='raise'):
    equal = clipped_grpo(extreme, extreme-1000, extreme, [1., 1.], valid)
    assert equal['loss'] == 0 and np.array_equal(equal['advantages'], [0., 0.])
    assert np.isposinf(equal['ratios']).all() and equal['clip_fraction'] == 1.
    assert np.array_equal(equal['kl'], extreme)
    no_penalty = clipped_grpo(extreme, extreme-1000, extreme+1000, [1., 1.], valid, beta=0.)
    assert no_penalty['loss'] == 0 and np.isposinf(no_penalty['kl']).all()
    positive = clipped_grpo(extreme, [[-1000.], [0.]], extreme, [2., 0.], valid)
    expected_adv = np.array([1., -1.])/(1+1e-8)
    assert np.allclose(positive['advantages'], expected_adv)
    assert np.isclose(positive['loss'], -(1.2*expected_adv[0]+expected_adv[1])/2)
    underflow = clipped_grpo(extreme, [[1000.], [0.]], extreme, [0., 2.], valid)
    assert underflow['ratios'][0, 0] == 0
    assert np.isclose(underflow['loss'], -(.8*expected_adv[1]+expected_adv[0])/2)
    huge_rewards = clipped_grpo(extreme, extreme, extreme, [-1e308, 1e308], valid)
    assert np.allclose(huge_rewards['advantages'], [-1., 1.]) and huge_rewards['loss'] == 0
    huge_equal = clipped_grpo(extreme, extreme-1000, extreme, [1e308, 1e308], valid)
    assert huge_equal['loss'] == 0 and np.array_equal(huge_equal['advantages'], [0., 0.])
    for thunk in [
        lambda: clipped_grpo(extreme, [[-1000.], [0.]], extreme, [0., 2.], valid),
        lambda: clipped_grpo(extreme, extreme, extreme+1000, [1., 1.], valid),
        lambda: clipped_grpo(extreme, extreme, extreme+700, [1., 1.], valid, beta=1e100),
        lambda: clipped_grpo(extreme, [[-710.], [0.]], extreme, [0., 1e-308], valid),
        lambda: clipped_grpo(extreme, extreme, extreme+710, [1., 1.], valid, beta=1e-308),
    ]:
        try:
            thunk()
        except FloatingPointError:
            pass
        else:
            raise AssertionError('Documented float64 range violations must fail explicitly')
print('Full clipped GRPO checks passed.')
