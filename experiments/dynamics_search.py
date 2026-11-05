"""Count grammar paths and shared prefixes; inspect HMM versus greedy decoding."""
from itertools import product
import numpy as np

slots = [['turn', 'move'], ['left', 'right'], ['slow', 'fast']]
sentences = list(product(*slots))
prefixes = {sentence[:length] for sentence in sentences for length in range(len(sentence)+1)}
print({'sentences': len(sentences), 'naive_word_nodes': sum(map(len, sentences)), 'shared_prefix_nodes': len(prefixes)})
initial = np.log([.8, .2]); transition = np.log([[.05, .95], [.01, .99]])
emission = np.log([[.9, .1], [.1, .9], [.1, .9]])
paths = list(product(range(2), repeat=3))
scores = [initial[p[0]]+sum(emission[t, p[t]] for t in range(3))+sum(transition[p[t-1], p[t]] for t in range(1, 3)) for p in paths]
print({'best_hmm_path': paths[int(np.argmax(scores))], 'best_log_score': max(scores), 'paths_scored_exhaustively': len(paths)})
print('Exhaustive enumeration is a tiny reference, not the scalable decoder. Implement Viterbi in the lab.')
