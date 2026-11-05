"""Explicit top-k then nucleus sampling distribution."""
import numpy as np


def decoding_probs(logits, temperature=1., top_k=None, top_p=1.):
    """Return probabilities in original vocabulary order from finite 1D logits.

    Nonempty logits; temperature>0; 0<top_p<=1; top_k None or integer 1..V.
    Apply temperature, top-k, normalize, then top-p and normalize again.
    Descending ties prefer smaller IDs. Include the nucleus crossing token.
    Reject invalid arguments with ValueError; do not mutate logits.
    """
    z = np.asarray(logits, float)
    if z.ndim != 1 or not z.size or not np.isfinite(z).all() or not np.isfinite(temperature) or temperature <= 0 or not np.isfinite(top_p) or not 0 < top_p <= 1:
        raise ValueError('invalid logits or sampling parameters')
    if top_k is not None and (not isinstance(top_k, int) or isinstance(top_k, bool) or not 1 <= top_k <= len(z)):
        raise ValueError('invalid top_k')
    order = np.argsort(-z, kind='stable')
    if top_k is not None:
        order = order[:top_k]
    scores = (z[order] - z[order[0]]) / temperature
    probs = np.exp(scores)
    probs /= probs.sum()
    count = min(len(probs), int(np.searchsorted(np.cumsum(probs), top_p, side='left')) + 1)
    result = np.zeros_like(z)
    result[order[:count]] = probs[:count] / probs[:count].sum()
    return result
