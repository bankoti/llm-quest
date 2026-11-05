"""Least-squares capacity studies with a stable solver."""
import numpy as np


def ridge_fit(x, y, penalty=0.):
    """Fit W [D,K] from X [N,D], Y [N,K], without an intercept.

    Objective ||XW-Y||^2 + penalty*||W||^2. Nonnegative finite penalty required.
    Assume nonempty finite arrays with compatible shapes. At zero penalty use
    the minimum-norm solution, including rank-deficient and D>N designs.
    """
    if not np.isfinite(penalty) or penalty < 0:
        raise ValueError('invalid penalty')
    d = x.shape[1]
    augmented = np.vstack([x, np.sqrt(penalty)*np.eye(d)])
    targets = np.vstack([y, np.zeros((d, y.shape[1]))])
    return np.linalg.lstsq(augmented, targets, rcond=None)[0]


def bias_variance(predictions, truth):
    """Return bias2, variance, mse for predictions [runs,points] and truth [points].

    Fixed noiseless truth; population variance over runs. MSE averages all runs
    and points. Thus mse = bias2 + variance (no observation-noise term here).
    Valid finite nonempty shapes assumed.
    """
    mean = predictions.mean(axis=0)
    return dict(bias2=float(((mean-truth)**2).mean()), variance=float(((predictions-mean)**2).mean()), mse=float(((predictions-truth)**2).mean()))
