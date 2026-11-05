"""Barlow Twins mechanism, not the complete training recipe."""
import numpy as np


def barlow_loss(view_a, view_b, redundancy=.005, epsilon=1e-5):
    """Return (loss, correlation) for matching finite [N,D] arrays, N>=2.

    Standardize columns with sqrt(population_variance+epsilon).
    C=Za.T@Zb/N. Loss=sum_i(1-Cii)^2 + redundancy*sum_i!=j Cij^2.
    Assume valid shapes, positive epsilon and nonnegative redundancy.
    Convert views to floating point and scale columns before standardization.
    """
    def standardize(view):
        view = np.asarray(view,float)
        scale = np.maximum(np.max(np.abs(view),axis=0),np.sqrt(epsilon))
        centered = view/scale
        centered = centered-centered.mean(0)
        denominator = np.hypot(np.sqrt((centered**2).mean(0)),np.sqrt(epsilon)/scale)
        return np.divide(centered,denominator,out=np.zeros_like(centered),where=denominator!=0)
    a,b = standardize(view_a),standardize(view_b)
    correlation = a.T@b/len(a)
    diagonal = np.eye(correlation.shape[0],dtype=bool)
    loss = ((1-correlation[diagonal])**2).sum()+redundancy*(correlation[~diagonal]**2).sum()
    return float(loss),correlation


def gram_distance(features, anchor):
    """MSE between cosine Gram matrices of [patches,features] arrays.

    Nonzero finite rows and matching patch counts assumed. Feature widths may
    differ. Normalize each row; compare pairwise patch similarities.
    Use floating arithmetic and scale each row before measuring its L2 norm.
    """
    a,b = [np.asarray(value,float) for value in (features,anchor)]
    a = a/np.max(np.abs(a),axis=1,keepdims=True)
    b = b/np.max(np.abs(b),axis=1,keepdims=True)
    a = a/np.linalg.norm(a,axis=1,keepdims=True)
    b = b/np.linalg.norm(b,axis=1,keepdims=True)
    return float(((a@a.T-b@b.T)**2).mean())
