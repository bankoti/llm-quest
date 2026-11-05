# Generated starter; edit the functions in the course editor or notebook.
"""Least-squares capacity studies with a stable solver."""
import numpy as np

def ridge_fit(x, y, penalty=0.0):
    """Fit W [D,K] from X [N,D], Y [N,K], without an intercept.

Objective ||XW-Y||^2 + penalty*||W||^2. Nonnegative finite penalty required.
Assume nonempty finite arrays with compatible shapes. At zero penalty use
the minimum-norm solution, including rank-deficient and D>N designs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def bias_variance(predictions, truth):
    """Return bias2, variance, mse for predictions [runs,points] and truth [points].

Fixed noiseless truth; population variance over runs. MSE averages all runs
and points. Thus mse = bias2 + variance (no observation-noise term here).
Valid finite nonempty shapes assumed."""
    raise NotImplementedError('Implement this function, then run the checks.')
