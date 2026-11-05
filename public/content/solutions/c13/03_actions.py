"""Blockwise attention and linear-path flow matching."""
import numpy as np


def block_mask(lengths):
    """Boolean [T,T] mask for ordered blocks; row=query, column=key.

    lengths are positive integers. All tokens within a block see each other;
    a block sees earlier blocks, never later ones. Invalid lengths: ValueError.
    """
    if not lengths or any(not isinstance(n,int) or isinstance(n,bool) or n < 1 for n in lengths):
        raise ValueError('positive block lengths required')
    block_ids = np.repeat(np.arange(len(lengths)),lengths)
    return block_ids[:,None] >= block_ids[None,:]


def flow_target(noise, actions, time):
    """Return (x_t, velocity) for x_t=(1-t)*noise+t*actions, v=actions-noise.

    Matching finite float arrays, scalar finite 0<=time<=1. Invalid time:
    ValueError. Do not mutate arrays. Convention runs noise at t=0 to data at 1.
    """
    if not np.isfinite(time) or not 0 <= time <= 1:
        raise ValueError('time must be in [0,1]')
    return (1-time)*noise+time*actions,actions-noise
