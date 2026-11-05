# Generated starter; edit the functions in the course editor or notebook.
"""Original grammar expansion and a tiny log-domain HMM decoder."""
from itertools import product
import numpy as np

def phone_sequences(slots, lexicon):
    """Return sorted unique tuples of phones from a Cartesian word-slot grammar.

slots: list[list[str]], lexicon: dict[str,list[str]]. Preserve phone order.
Empty grammar produces [()]. An empty slot produces no sequences.
Missing word pronunciation: ValueError. No mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')

def viterbi(log_initial, log_transition, log_emission):
    """Return (state path, best log score) for a small HMM.

Initial [S], transition [S,S] indexed previous,next, emission [T,S].
T,S>=1; finite or -inf log scores, valid shapes assumed. First-ID tie break.
Include emission at t=0; backtrack globally, not greedy per-step choices."""
    raise NotImplementedError('Implement this function, then run the checks.')
