"""Barlow Twins mechanism, not the complete training recipe."""
import numpy as np


def _standardize_columns(view, epsilon):
    """Standardize float columns, preserving finite reference differences."""
    view = np.asarray(view,float)
    root_epsilon = np.sqrt(epsilon)
    with np.errstate(over='ignore',invalid='ignore'):
        shifted = view-view[:1]
        shifted_mean = shifted.mean(0)
        centered = shifted-shifted_mean
    stable = np.isfinite(shifted).all(0)&np.isfinite(shifted_mean)&np.isfinite(centered).all(0)
    epsilon_units = np.full(view.shape[1],root_epsilon)
    if not stable.all():
        fallback = view[:,~stable]
        fallback_scale = np.maximum(np.max(np.abs(fallback),axis=0),root_epsilon)
        fallback = fallback/fallback_scale
        centered[:,~stable] = fallback-fallback.mean(0)
        epsilon_units[~stable] = root_epsilon/fallback_scale
    scale = np.maximum(np.max(np.abs(centered),axis=0),epsilon_units)
    scale[scale==0] = 1.
    centered = centered/scale
    denominator = np.hypot(np.sqrt((centered**2).mean(0)),epsilon_units/scale)
    return np.divide(centered,denominator,out=np.zeros_like(centered),where=denominator!=0)


def barlow_loss(view_a, view_b, redundancy=.005, epsilon=1e-5):
    """Return (loss, correlation) for matching finite [N,D] arrays, N>=2.

    Standardize columns with sqrt(population_variance+epsilon).
    C=Za.T@Zb/N. Loss=sum_i(1-Cii)^2 + redundancy*sum_i!=j Cij^2.
    Assume valid shapes, finite positive epsilon and finite nonnegative redundancy.
    The supplied helper centers finite reference differences before scaling
    deviations, with a scaled-original fallback only for nonfinite centering.
    """
    a,b = _standardize_columns(view_a,epsilon),_standardize_columns(view_b,epsilon)
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
