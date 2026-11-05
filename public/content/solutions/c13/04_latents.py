"""Masked latent prediction and EMA target mechanics."""
import numpy as np


def latent_mse(prediction, target, mask):
    """Mean squared feature error over selected [B,T] target positions.

    prediction/target matching finite [B,T,D], Boolean mask [B,T]. Reject
    mismatched shapes, nonfinite values, or empty mask with ValueError.
    Average over selected positions AND D features. Do not mutate arrays.
    """
    p,t,m = np.asarray(prediction),np.asarray(target),np.asarray(mask)
    if p.ndim != 3 or p.shape != t.shape or m.shape != p.shape[:2] or m.dtype.kind != 'b' or not m.any() or p.shape[-1] == 0 or not np.isfinite(p).all() or not np.isfinite(t).all():
        raise ValueError('invalid prediction target or mask')
    return float(((p[m]-t[m])**2).mean())


def ema_target(target, online, momentum):
    """Return fresh m*target+(1-m)*online. Matching finite arrays assumed.

    Require finite 0<=momentum<=1, else ValueError. No input mutation.
    This is an update rule, not proof of noncollapse.
    """
    if not np.isfinite(momentum) or not 0 <= momentum <= 1:
        raise ValueError('invalid momentum')
    return momentum*target+(1-momentum)*online
