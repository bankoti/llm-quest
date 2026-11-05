# Generated starter; edit the functions in the course editor or notebook.
"""Episodic discounted REINFORCE objective."""
import numpy as np

def discounted_returns(rewards, gamma):
    """Return G_t=sum_{k>=t} gamma^(k-t)*r_k for finite 1D rewards.

Require finite 0<=gamma<=1, else ValueError. Empty sequence returns empty."""
    raise NotImplementedError('Implement this function, then run the checks.')

def reinforce_loss(log_probabilities, rewards, mask, gamma=1.0, baseline=0.0):
    """Mean episode loss for discounted initial-state return.

Matching [B,T] log probabilities/rewards and Boolean mask. Masks are
nonempty true prefixes followed by padding. Assume finite valid arrays.
L=-mean_b sum_t gamma^t*logp_bt*(G_bt-baseline). Baseline is a fixed scalar,
not differentiated. Ignore all padding; do not average across token count."""
    raise NotImplementedError('Implement this function, then run the checks.')
