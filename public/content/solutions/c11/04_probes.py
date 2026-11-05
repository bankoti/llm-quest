"""Frozen linear probes and explicit Fourier interventions."""
import numpy as np


def fit_probe(features, targets, ridge=0.):
    """Fit W [D,K] to finite features [N,D], targets [N,K], no intercept.

    Minimize ||HW-Y||^2 + ridge*||W||^2. ridge>=0; otherwise ValueError.
    Return the minimum-norm solution when ridge=0. No feature updates.
    """
    if not np.isfinite(ridge) or ridge < 0:
        raise ValueError('invalid ridge')
    h, y = np.asarray(features, float), np.asarray(targets, float)
    design = np.vstack([h, np.sqrt(ridge)*np.eye(h.shape[1])])
    response = np.vstack([y, np.zeros((h.shape[1], y.shape[1]))])
    return np.linalg.lstsq(design, response, rcond=None)[0]


def fourier_parts(grid, keep):
    """Return (restricted, excluded) complex inverse-FFT grids.

    grid finite 2D, keep matching Boolean mask. Complex results are intentional:
    nonsymmetric masks need not reconstruct real signals. Their sum must equal
    grid. Do not discard imaginary parts or modify inputs.
    """
    spectrum = np.fft.fft2(grid)
    return np.fft.ifft2(np.where(keep, spectrum, 0)), np.fft.ifft2(np.where(keep, 0, spectrum))
