"""Paired bootstrap over explicitly synthetic binary outcomes."""
import numpy as np


def paired_success(a, b, seed=0, resamples=2000):
    """Return dict difference, lower, upper for paired B-minus-A outcomes.

    Nonempty matching 1D binary arrays. Integer resamples>=100; invalid:
    ValueError. Percentile interval at 2.5/97.5 using default_rng(seed).
    Resample N paired indices with replacement per draw. This is not a
    distribution-shift or physical-safety guarantee.
    """
    a,b=np.asarray(a),np.asarray(b)
    if a.ndim!=1 or a.shape!=b.shape or not a.size or not np.isin(a,[0,1]).all() or not np.isin(b,[0,1]).all() or not isinstance(resamples,int) or isinstance(resamples,bool) or resamples<100:
        raise ValueError('invalid paired outcomes or bootstrap size')
    differences=b.astype(float)-a.astype(float)
    rng=np.random.default_rng(seed)
    draws=differences[rng.integers(len(a),size=(resamples,len(a)))].mean(-1)
    lower,upper=np.quantile(draws,[.025,.975])
    return dict(difference=float(differences.mean()),lower=float(lower),upper=float(upper))
