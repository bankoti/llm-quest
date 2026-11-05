import numpy as np
h = np.arange(3 * 5 * 2).reshape(3, 5, 2)
m = np.array([[0, 0, 1, 1, 1], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0]], bool)
assert np.array_equal(last_valid(h, m), h[[0, 1, 2], [4, 1, 2]]), 'Pool by position, not length minus one'
got = last_valid(h, m)
got[:] = -1
assert h.min() == 0
result = binary_metrics([0] * 90 + [1] * 10, [0] * 100)
assert result['accuracy'] == .9 and np.isclose(result['macro_f1'], 9 / 19)
assert (result['tp'], result['fp'], result['fn'], result['tn']) == (0, 0, 10, 90)
assert binary_metrics([0, 1], [0, 1])['macro_f1'] == 1
assert binary_metrics([0, 1], [1, 0])['macro_f1'] == 0
assert binary_metrics([1, 1], [1, 1])['macro_f1'] == .5
for call in [lambda: last_valid(h, np.zeros((3, 5), bool)), lambda: binary_metrics([], []), lambda: binary_metrics([2], [0])]:
    try:
        call()
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid evaluation inputs')
print('Classification checks passed.')
