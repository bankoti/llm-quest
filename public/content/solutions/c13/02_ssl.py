"""Barlow Twins mechanism, not the complete training recipe."""
import numpy as np


def barlow_loss(view_a, view_b, redundancy=.005, epsilon=1e-5):
    """Return (loss, correlation) for matching finite [N,D] arrays, N>=2.

    Standardize columns with sqrt(population_variance+epsilon).
    C=Za.T@Zb/N. Loss=sum_i(1-Cii)^2 + redundancy*sum_i!=j Cij^2.
    Assume valid shapes, positive epsilon and nonnegative redundancy.
    """
    a = (view_a-view_a.mean(0))/np.sqrt(view_a.var(0)+epsilon)
    b = (view_b-view_b.mean(0))/np.sqrt(view_b.var(0)+epsilon)
    correlation = a.T@b/len(a)
    diagonal = np.eye(correlation.shape[0],dtype=bool)
    loss = ((1-correlation[diagonal])**2).sum()+redundancy*(correlation[~diagonal]**2).sum()
    return float(loss),correlation


def gram_distance(features, anchor):
    """MSE between cosine Gram matrices of [patches,features] arrays.

    Nonzero finite rows and matching patch counts assumed. Feature widths may
    differ. Normalize each row; compare pairwise patch similarities.
    """
    a = features/np.linalg.norm(features,axis=1,keepdims=True)
    b = anchor/np.linalg.norm(anchor,axis=1,keepdims=True)
    return float(((a@a.T-b@b.T)**2).mean())
