"""Linear residual-chain mechanics; not a nonlinear ensemble identity."""
from math import comb
import numpy as np


def path_counts(depth):
    """Return counts for k=0..depth transformed branches. Reject invalid depth."""
    if not isinstance(depth, int) or isinstance(depth, bool) or depth < 0:
        raise ValueError('depth must be a nonnegative integer')
    return [comb(depth, k) for k in range(depth + 1)]


def linear_chain(x, matrices, residual=True):
    """Apply [D,D] matrices to column vector x [D] in list order.

    In residual mode x <- x+W@x; otherwise x <- W@x. Valid finite shapes
    assumed. Return a fresh array even for no blocks; do not mutate inputs.
    """
    state = np.array(x, dtype=float, copy=True)
    for weight in matrices:
        update = weight @ state
        state = state + update if residual else update
    return state
