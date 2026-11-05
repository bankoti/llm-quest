# Generated starter; edit the functions in the course editor or notebook.
"""Barlow Twins mechanism, not the complete training recipe."""
import numpy as np

def barlow_loss(view_a, view_b, redundancy=0.005, epsilon=1e-05):
    """Return (loss, correlation) for matching finite [N,D] arrays, N>=2.

Standardize columns with sqrt(population_variance+epsilon).
C=Za.T@Zb/N. Loss=sum_i(1-Cii)^2 + redundancy*sum_i!=j Cij^2.
Assume valid shapes, positive epsilon and nonnegative redundancy.
Convert views to floating point and scale columns before standardization."""
    raise NotImplementedError('Implement this function, then run the checks.')

def gram_distance(features, anchor):
    """MSE between cosine Gram matrices of [patches,features] arrays.

Nonzero finite rows and matching patch counts assumed. Feature widths may
differ. Normalize each row; compare pairwise patch similarities.
Use floating arithmetic and scale each row before measuring its L2 norm."""
    raise NotImplementedError('Implement this function, then run the checks.')
