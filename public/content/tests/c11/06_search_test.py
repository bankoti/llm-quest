import numpy as np
from itertools import product
assert phone_sequences([['a', 'b'], ['c']], {'a': ['A'], 'b': ['B', 'B'], 'c': ['C']}) == [('A', 'C'), ('B', 'B', 'C')]
assert phone_sequences([], {}) == [()]
assert phone_sequences([[]], {}) == []
initial = np.log([.6, .4]); transition = np.log([[.7, .3], [.2, .8]])
emission = np.log([[.1, .9], [.8, .2], [.7, .3]])
paths = list(product(range(2), repeat=3))
scores = [initial[p[0]] + sum(emission[t, p[t]] for t in range(3)) + sum(transition[p[t-1], p[t]] for t in range(1, 3)) for p in paths]
path, score = viterbi(initial, transition, emission)
assert tuple(path) == paths[int(np.argmax(scores))] and np.isclose(score, max(scores))
for dtype, raw_initial, raw_transition, raw_emission in [
    (np.int8, [-100, -101], [[-60, -20], [-30, -70]], [[-100, -90], [-80, -100]]),
    (np.uint8, [200, 201], [[100, 150], [160, 170]], [[50, 60], [100, 110]]),
]:
    operands = [np.array(values, dtype=dtype) for values in (raw_initial, raw_transition, raw_emission)]
    before = [values.copy() for values in operands]
    candidates = list(product(range(2), repeat=2))
    expected = [float(operands[0][p[0]]) + sum(float(operands[2][t, p[t]]) for t in range(2)) + float(operands[1][p[0], p[1]]) for p in candidates]
    path, score = viterbi(*operands)
    assert tuple(path) == candidates[int(np.argmax(expected))] and score == max(expected)
    assert all(np.array_equal(values, saved) for values, saved in zip(operands, before))
print('Grammar and HMM checks passed.')
