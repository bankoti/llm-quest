# Generated starter; edit the functions in the course editor or notebook.
"""Frozen linear probes and explicit Fourier interventions."""
import numpy as np

def fit_probe(features, targets, ridge=0.0):
    """Fit W [D,K] to finite features [N,D], targets [N,K], no intercept.

Minimize ||HW-Y||^2 + ridge*||W||^2. ridge>=0; otherwise ValueError.
Return the minimum-norm solution when ridge=0. No feature updates."""
    raise NotImplementedError('Implement this function, then run the checks.')

def fourier_parts(grid, keep):
    """Return (restricted, excluded) complex inverse-FFT grids.

grid finite 2D, keep matching Boolean mask. Complex results are intentional:
nonsymmetric masks need not reconstruct real signals. Their sum must equal
grid. Do not discard imaginary parts or modify inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
