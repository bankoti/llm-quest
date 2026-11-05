# Generated starter; edit the functions in the course editor or notebook.
"""Blockwise attention and linear-path flow matching."""
import numpy as np

def block_mask(lengths):
    """Boolean [T,T] mask for ordered blocks; row=query, column=key.

lengths are positive integers. All tokens within a block see each other;
a block sees earlier blocks, never later ones. Invalid lengths: ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')

def flow_target(noise, actions, time):
    """Return (x_t, velocity) for x_t=(1-t)*noise+t*actions, v=actions-noise.

Matching finite float arrays, scalar finite 0<=time<=1. Invalid time:
ValueError. Do not mutate arrays. Convention runs noise at t=0 to data at 1."""
    raise NotImplementedError('Implement this function, then run the checks.')
