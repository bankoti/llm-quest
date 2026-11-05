import math
import numpy as np


def _decoding_oracle(logits, temperature, top_k, top_p):
    order = sorted(range(len(logits)), key=lambda index: (-float(logits[index]), index))
    if top_k is not None:
        order = order[:top_k]
    weights = [math.exp((float(logits[index])-float(logits[order[0]]))/temperature) for index in order]
    probabilities = [weight/sum(weights) for weight in weights]
    selected, mass = [], 0.
    for index, probability in zip(order, probabilities):
        selected.append((index, probability))
        mass += probability
        if mass >= top_p:
            break
    result = np.zeros(len(logits))
    for index, probability in selected:
        result[index] = probability/sum(value for _, value in selected)
    return result


z = np.log([.5, .3, .15, .05])
assert np.allclose(decoding_probs(z, top_p=.7), [.625, .375, 0, 0]), 'Include the crossing token'
assert np.allclose(decoding_probs(z, top_k=2, top_p=.6), [1, 0, 0, 0]), 'Top-k renormalization precedes top-p'
assert np.allclose(decoding_probs([0, 0, 0], top_k=2), [.5, .5, 0]), 'Stable ID tie-breaking'
assert np.allclose(decoding_probs([10000, 10001]), [1/(1+np.e), np.e/(1+np.e)])
assert np.allclose(decoding_probs(np.log([.2, .8]), temperature=2), [1/3, 2/3])
assert np.allclose(decoding_probs(z, top_p=1), np.exp(z))
assert np.allclose(z, np.log([.5, .3, .15, .05]))
huge = np.array([1e308, -1e308])
before = huge.copy()
with np.errstate(over='raise', under='raise', invalid='raise'):
    expected = np.array([1., np.exp(-2.)])/(1+np.exp(-2.))
    np.testing.assert_allclose(decoding_probs(huge, temperature=1e308, top_p=.9), expected, rtol=1e-14, atol=0.)
    np.testing.assert_allclose(decoding_probs([1e308, 1e308], temperature=.1), [.5, .5], rtol=0., atol=0.)
    np.testing.assert_allclose(decoding_probs([1e308, np.nextafter(1e308, 0.)], temperature=.5), [1., 0.], rtol=0., atol=0.)
    np.testing.assert_allclose(decoding_probs(huge, temperature=.1, top_p=.9), [1., 0.], rtol=0., atol=0.)
    np.testing.assert_allclose(decoding_probs([1e308, 1e308, 1e308], temperature=.25, top_k=2, top_p=.6), [.5, .5, 0.], rtol=0., atol=0.)
    np.testing.assert_allclose(decoding_probs([1e308, 1e308, 1e308], temperature=.25, top_k=2, top_p=.4), [1., 0., 0.], rtol=0., atol=0.)
assert np.array_equal(huge, before)
offset_logits = np.array([2**54, 2**54-2], dtype=float)
before = offset_logits.copy()
expected = np.array([1., np.exp(-2/3)])/(1+np.exp(-2/3))
np.testing.assert_allclose(decoding_probs(offset_logits, temperature=3., top_p=1.), expected, rtol=1e-14, atol=0.)
np.testing.assert_allclose(decoding_probs(offset_logits, temperature=3., top_p=.7), expected, rtol=1e-14, atol=0.)
np.testing.assert_allclose(decoding_probs(offset_logits, temperature=3., top_p=.6), [1., 0.], rtol=0., atol=0.)
assert np.array_equal(offset_logits, before)
base_logits = np.array([-2., 0., -2., -4.])
offset_logits = base_logits + 2**54
before = offset_logits.copy()
for top_k in [None, 1, 2, 3]:
    for top_p in [.6, .7, 1.]:
        expected = _decoding_oracle(base_logits, 3., top_k, top_p)
        np.testing.assert_allclose(decoding_probs(offset_logits, 3., top_k, top_p), expected, rtol=1e-14, atol=0.)
        np.testing.assert_allclose(decoding_probs(offset_logits, 3., top_k, top_p), decoding_probs(base_logits, 3., top_k, top_p), rtol=1e-14, atol=0.)
expected = np.array([np.exp(-2/3), 1., 0., 0.])/(1+np.exp(-2/3))
np.testing.assert_allclose(decoding_probs(offset_logits, temperature=3., top_k=2, top_p=.7), expected, rtol=1e-14, atol=0.)
np.testing.assert_allclose(decoding_probs(offset_logits, temperature=3., top_k=2, top_p=.6), [0., 1., 0., 0.], rtol=0., atol=0.)
assert np.array_equal(offset_logits, before)
rng = np.random.default_rng(717)
for logits in [rng.normal(size=7)*3, np.array([2., 2., -1., 0., 2., -4., .5])]:
    before = logits.copy()
    for temperature in [.1, .8, 1., 3.]:
        for top_k in [None, 1, 3]:
            for top_p in [.4, .9, 1.]:
                expected = _decoding_oracle(logits, temperature, top_k, top_p)
                np.testing.assert_allclose(decoding_probs(logits, temperature, top_k, top_p), expected, rtol=1e-13, atol=1e-15)
    assert np.array_equal(logits, before)
for kwargs in [dict(temperature=0), dict(top_p=0), dict(top_p=1.1), dict(top_k=0), dict(top_k=True), dict(top_k=5)]:
    try:
        decoding_probs(z, **kwargs)
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid decoding controls')
print('Decoding-policy checks passed.')
