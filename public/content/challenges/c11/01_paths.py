# Generated starter; edit the functions in the course editor or notebook.
"""Linear residual-chain mechanics; not a nonlinear ensemble identity."""
from math import comb
import numpy as np

def path_counts(depth):
    """Return counts for k=0..depth transformed branches. Reject invalid depth."""
    raise NotImplementedError('Implement this function, then run the checks.')

def linear_chain(x, matrices, residual=True):
    """Apply [D,D] matrices to column vector x [D] in list order.

In residual mode x <- x+W@x; otherwise x <- W@x. Valid finite shapes
assumed. Return a fresh array even for no blocks; do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
