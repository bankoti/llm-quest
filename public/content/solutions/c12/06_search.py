"""PUCT-style selection and perspective-aware value backup."""
import numpy as np


def puct_select(priors, values, visits, exploration=1.):
    """Return first argmax of Q+c*P*sqrt(1+sum(N))/(1+N).

    Valid finite matching 1D arrays assumed: priors>=0 sum=1, visits>=0,
    exploration>=0. values are action mean values in the parent's perspective.
    Convert priors, values, and visits to floating point before score arithmetic.
    """
    priors,values,visits = [np.asarray(value,float) for value in (priors,values,visits)]
    scores = values+exploration*priors*np.sqrt(1+visits.sum())/(1+visits)
    return int(np.argmax(scores))


def backup_values(leaf_value, edges, alternating=True):
    """Return values at nodes root..leaf for a path with `edges` edges.

    leaf_value is in the leaf player's perspective. Flip once per edge for
    alternating zero-sum play; keep the value for single-agent planning.
    edges nonnegative integer, leaf_value finite; valid inputs assumed.
    """
    return [float(leaf_value*((-1)**(edges-i) if alternating else 1)) for i in range(edges+1)]
