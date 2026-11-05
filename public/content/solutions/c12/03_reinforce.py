"""Episodic discounted REINFORCE objective."""
import numpy as np


def discounted_returns(rewards, gamma):
    """Return G_t=sum_{k>=t} gamma^(k-t)*r_k for finite 1D rewards.

    Require finite 0<=gamma<=1, else ValueError. Empty sequence returns empty.
    """
    if not np.isfinite(gamma) or not 0 <= gamma <= 1:
        raise ValueError('invalid discount')
    result = np.empty(len(rewards), float); running = 0.
    for t in range(len(rewards)-1, -1, -1):
        running = rewards[t] + gamma*running
        result[t] = running
    return result


def reinforce_loss(log_probabilities, rewards, mask, gamma=1., baseline=0.):
    """Mean episode loss for discounted initial-state return.

    Matching [B,T] log probabilities/rewards and Boolean mask. Masks are
    nonempty true prefixes followed by padding. Assume finite valid arrays.
    L=-mean_b sum_t gamma^t*logp_bt*(G_bt-baseline). Baseline is a fixed scalar,
    not differentiated. Ignore all padding; do not average across token count.
    """
    losses = []
    for logp, r, valid in zip(log_probabilities, rewards, mask):
        count = int(valid.sum())
        returns = discounted_returns(r[:count], gamma)
        losses.append(-np.sum(gamma**np.arange(count)*logp[:count]*(returns-baseline)))
    return float(np.mean(losses))
