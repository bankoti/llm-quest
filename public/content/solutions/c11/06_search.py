"""Original grammar expansion and a tiny log-domain HMM decoder."""
from itertools import product
import numpy as np


def phone_sequences(slots, lexicon):
    """Return sorted unique tuples of phones from a Cartesian word-slot grammar.

    slots: list[list[str]], lexicon: dict[str,list[str]]. Preserve phone order.
    Empty grammar produces [()]. An empty slot produces no sequences.
    Missing word pronunciation: ValueError. No mutation.
    """
    if any(word not in lexicon for slot in slots for word in slot):
        raise ValueError('missing pronunciation')
    return sorted({tuple(phone for word in sentence for phone in lexicon[word]) for sentence in product(*slots)})


def viterbi(log_initial, log_transition, log_emission):
    """Return (state path, best log score) for a small HMM.

    Initial [S], transition [S,S] indexed previous,next, emission [T,S].
    T,S>=1; finite or -inf log scores, valid shapes assumed. First-ID tie break.
    Include emission at t=0; backtrack globally, not greedy per-step choices.
    """
    scores = np.asarray(log_initial) + log_emission[0]
    parents = []
    for emissions in log_emission[1:]:
        candidate = scores[:, None] + log_transition
        previous = candidate.argmax(axis=0)
        parents.append(previous)
        scores = candidate[previous, np.arange(len(scores))] + emissions
    state = int(scores.argmax()); best = float(scores[state]); path = [state]
    for previous in reversed(parents):
        state = int(previous[state]); path.append(state)
    return list(reversed(path)), best
