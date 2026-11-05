import numpy as np
z = np.log([.5, .3, .15, .05])
assert np.allclose(decoding_probs(z, top_p=.7), [.625, .375, 0, 0]), 'Include the crossing token'
assert np.allclose(decoding_probs(z, top_k=2, top_p=.6), [1, 0, 0, 0]), 'Top-k renormalization precedes top-p'
assert np.allclose(decoding_probs([0, 0, 0], top_k=2), [.5, .5, 0]), 'Stable ID tie-breaking'
assert np.allclose(decoding_probs([10000, 10001]), [1/(1+np.e), np.e/(1+np.e)])
assert np.allclose(decoding_probs(np.log([.2, .8]), temperature=2), [1/3, 2/3])
assert np.allclose(decoding_probs(z, top_p=1), np.exp(z))
assert np.allclose(z, np.log([.5, .3, .15, .05]))
for kwargs in [dict(temperature=0), dict(top_p=0), dict(top_p=1.1), dict(top_k=0), dict(top_k=True), dict(top_k=5)]:
    try:
        decoding_probs(z, **kwargs)
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid decoding controls')
print('Decoding-policy checks passed.')
