import numpy as np
np.testing.assert_allclose(bits_per_byte([np.log(2), 3*np.log(2)], 2), 2)
assert bits_per_byte([0, 0], 3) == 0
# Same content, different number of prediction units: sum losses first.
np.testing.assert_allclose(bits_per_byte([np.log(2)]*8, 4), bits_per_byte([2*np.log(2)]*4, 4))
assert logit_storage(10, 1000) == 40000
assert logit_storage(10, 1000, 5) == 400
assert logit_storage(10, 1000, 1000) == 80000
assert logit_storage(45, 256) == 46080
_counts, _times = [10, 90], [100., 300.]
assert serving_summary(_counts, _times) == {'bytes_per_second': 250., 'p95_ms': 300.}
assert serving_summary([1]*20, list(range(1,21)))['p95_ms'] == 19
assert _counts == [10,90] and _times == [100.,300.]
for _budget, _region in [(10,'measured'),(20,'measured'),(15,'interpolated'),(9,'extrapolated'),(100,'extrapolated')]:
    assert evidence_region([20, 10, 20], _budget) == _region
assert evidence_region([10], 11) == 'extrapolated'
for _call in [
    lambda: bits_per_byte([], 1), lambda: bits_per_byte([-1], 1),
    lambda: bits_per_byte([np.nan], 1), lambda: bits_per_byte([1], 0),
    lambda: bits_per_byte([1], 1.5), lambda: bits_per_byte([1], True),
    lambda: logit_storage(2.5, 256), lambda: logit_storage(1, 0),
    lambda: logit_storage(1, 256, 257), lambda: logit_storage(1, 256, True),
    lambda: serving_summary([1], [0]), lambda: serving_summary([1.5], [1]),
    lambda: serving_summary([1], [1, 2]), lambda: serving_summary([], []),
    lambda: serving_summary([1], [np.inf]), lambda: evidence_region([], 1),
    lambda: evidence_region([0, 1], 1), lambda: evidence_region([1], np.nan),
]:
    try:
        _call()
    except ValueError:
        pass
    else:
        raise AssertionError('invalid measurement must raise ValueError')
print('BPB denominator, dense/sparse payload, sequential throughput, p95 and evidence regions passed.')
