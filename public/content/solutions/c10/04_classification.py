"""Pooling and binary classification metrics."""
import numpy as np


def last_valid(hidden, attention_mask):
    """Gather [B,D] from finite hidden [B,T,D] at the LAST true mask position.

    attention_mask is Boolean [B,T]; left/right padding and gaps are allowed.
    Reject mismatched shapes or rows with no valid positions with ValueError.
    Return a fresh array; never mutate inputs.
    """
    h, mask = np.asarray(hidden), np.asarray(attention_mask)
    if h.ndim != 3 or mask.shape != h.shape[:2] or mask.dtype.kind != 'b' or h.shape[1] == 0:
        raise ValueError('invalid shape or mask')
    if not mask.any(axis=1).all() or not np.isfinite(h).all():
        raise ValueError('empty sequence or invalid features')
    indices = np.where(mask, np.arange(h.shape[1]), -1).max(axis=1)
    return h[np.arange(h.shape[0]), indices].copy()


def binary_metrics(labels, predictions):
    """Return accuracy, macro_f1, tp, fp, fn, tn for nonempty 1D binary IDs.

    Classwise F1=2TP/(2TP+FP+FN); a zero denominator gives 0.
    Macro F1 includes both classes even if one has zero support.
    Invalid shapes, empty input, or values outside {0,1}: ValueError.
    """
    y, p = np.asarray(labels), np.asarray(predictions)
    if y.ndim != 1 or p.shape != y.shape or not y.size or not np.isin(y, [0, 1]).all() or not np.isin(p, [0, 1]).all():
        raise ValueError('nonempty matching binary arrays required')
    tp = int(((y == 1) & (p == 1)).sum())
    fp = int(((y == 0) & (p == 1)).sum())
    fn = int(((y == 1) & (p == 0)).sum())
    tn = int(((y == 0) & (p == 0)).sum())
    f1s = [2 * correct / (2 * correct + fp + fn) if 2 * correct + fp + fn else 0. for correct in (tp, tn)]
    return dict(accuracy=(tp + tn) / y.size, macro_f1=sum(f1s) / 2, tp=tp, fp=fp, fn=fn, tn=tn)
