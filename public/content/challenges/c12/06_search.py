# Generated starter; edit the functions in the course editor or notebook.
"""PUCT-style selection and perspective-aware value backup."""
import numpy as np

def puct_select(priors, values, visits, exploration=1.0):
    """Return first argmax of Q+c*P*sqrt(1+sum(N))/(1+N).

Valid finite matching 1D arrays assumed: priors>=0 sum=1, visits>=0,
exploration>=0. values are action mean values in the parent's perspective."""
    raise NotImplementedError('Implement this function, then run the checks.')

def backup_values(leaf_value, edges, alternating=True):
    """Return values at nodes root..leaf for a path with `edges` edges.

leaf_value is in the leaf player's perspective. Flip once per edge for
alternating zero-sum play; keep the value for single-agent planning.
edges nonnegative integer, leaf_value finite; valid inputs assumed."""
    raise NotImplementedError('Implement this function, then run the checks.')
