# Generated starter; edit the functions in the course editor or notebook.
"""Token-weighted loss and optimizer-step utilities. NumPy only."""
import numpy as np

def loss_totals(logits, targets, mask):
    """Return (NLL sum, valid count) for [B,T,V] logits and [B,T] targets/mask.

Targets are integer IDs in [0,V); mask is Boolean. Require finite logits,
matching nonempty shapes, and at least one selected target; else ValueError.
Use stable logsumexp. Do not modify inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def clip_gradient(gradient, max_norm):
    """Return a fresh array with global L2 norm at most positive max_norm.

gradient is any finite float array; reject nonpositive/nonfinite max_norm.
Zero gradients stay zero. Preserve direction; do not clip coordinates.
Scale magnitudes before measuring the norm to avoid overflow/underflow."""
    raise NotImplementedError('Implement this function, then run the checks.')

def learning_rate(step, total, warmup, peak, floor=0.0):
    """Zero-based schedule. Integers: 0<=step<total, 0<=warmup<total.

Require 0<=floor<=peak, finite rates. Warm-up: peak*(step+1)/warmup.
Decay: cosine from peak at step=warmup to floor at step=total-1.
If there is only one decay update, use floor for that update."""
    raise NotImplementedError('Implement this function, then run the checks.')
