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
print('Grammar and HMM checks passed.')
