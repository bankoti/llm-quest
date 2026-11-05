# Generated starter; edit the functions in the course editor or notebook.
"""Pooling and binary classification metrics."""
import numpy as np

def last_valid(hidden, attention_mask):
    """Gather [B,D] from finite hidden [B,T,D] at the LAST true mask position.

attention_mask is Boolean [B,T]; left/right padding and gaps are allowed.
Reject mismatched shapes or rows with no valid positions with ValueError.
Return a fresh array; never mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def binary_metrics(labels, predictions):
    """Return accuracy, macro_f1, tp, fp, fn, tn for nonempty 1D binary IDs.

Classwise F1=2TP/(2TP+FP+FN); a zero denominator gives 0.
Macro F1 includes both classes even if one has zero support.
Invalid shapes, empty input, or values outside {0,1}: ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')
