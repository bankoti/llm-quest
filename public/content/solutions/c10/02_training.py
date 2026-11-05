"""Token-weighted loss and optimizer-step utilities. NumPy only."""
import numpy as np


def loss_totals(logits, targets, mask):
    """Return (NLL sum, valid count) for [B,T,V] logits and [B,T] targets/mask.

    Targets are integer IDs in [0,V); mask is Boolean. Require finite logits,
    matching nonempty shapes, and at least one selected target; else ValueError.
    Use stable logsumexp. Do not modify inputs.
    """
    z, y, m = np.asarray(logits, float), np.asarray(targets), np.asarray(mask)
    if z.ndim != 3 or z.shape[-1] == 0 or y.shape != z.shape[:-1] or m.shape != y.shape:
        raise ValueError('shape mismatch')
    if y.dtype.kind not in 'iu' or m.dtype.kind != 'b' or not m.any():
        raise ValueError('integer targets and a nonempty Boolean mask required')
    if not np.isfinite(z).all() or (y < 0).any() or (y >= z.shape[-1]).any():
        raise ValueError('invalid logits or targets')
    shifted = z - z.max(axis=-1, keepdims=True)
    nll = np.log(np.exp(shifted).sum(axis=-1)) - np.take_along_axis(shifted, y[..., None], -1)[..., 0]
    return float(nll[m].sum()), int(m.sum())


def clip_gradient(gradient, max_norm):
    """Return a fresh array with global L2 norm at most positive max_norm.

    gradient is any finite float array; reject nonpositive/nonfinite max_norm.
    Zero gradients stay zero. Preserve direction; do not clip coordinates.
    Scale magnitudes before measuring the norm to avoid overflow/underflow.
    """
    g = np.asarray(gradient, float)
    if not np.isfinite(g).all() or not np.isfinite(max_norm) or max_norm <= 0:
        raise ValueError('finite gradient and positive limit required')
    magnitude = np.max(np.abs(g), initial=0.)
    if magnitude == 0:
        return g.copy()
    scaled = g / magnitude
    norm = np.linalg.norm(scaled.ravel())
    if magnitude <= max_norm / norm:
        return g.copy()
    factor = (max_norm / norm) / magnitude
    if factor >= np.finfo(float).tiny:
        return g * factor
    return scaled * (max_norm / norm)


def learning_rate(step, total, warmup, peak, floor=0.):
    """Zero-based schedule. Integers: 0<=step<total, 0<=warmup<total.

    Require 0<=floor<=peak, finite rates. Warm-up: peak*(step+1)/warmup.
    Decay: cosine from peak at step=warmup to floor at step=total-1.
    If there is only one decay update, use floor for that update.
    """
    if any(not isinstance(v, int) or isinstance(v, bool) for v in (step, total, warmup)):
        raise ValueError('integer update indices required')
    if not 0 <= step < total or not 0 <= warmup < total or not 0 <= floor <= peak or not np.isfinite([peak, floor]).all():
        raise ValueError('invalid schedule')
    if step < warmup:
        return peak * ((step + 1) / warmup)
    length = total - warmup
    phase = (step - warmup) / (length - 1) if length > 1 else 1.
    return float(floor + .5 * (peak - floor) * (1 + np.cos(np.pi * phase)))
