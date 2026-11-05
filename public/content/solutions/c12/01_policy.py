"""Binary sigmoid policy and L1 imitation gradients."""
import numpy as np


def imitation_l1(states, actions, weights, bias):
    """Return dict probabilities, loss, grad_w, grad_b.

    states finite [N,D], binary actions [N], weights [D], scalar bias; N>0.
    Mean L1 between sigmoid probabilities and binary expert actions.
    Assume valid shapes/values. Compute in floating point, including for
    integer inputs. Stable at extreme logits; no input mutation.
    Infinite logits from overflow use the sigmoid limits 0/1. Raise
    FloatingPointError for indeterminate NaN logits or nonfinite results.
    Evaluate both sigmoid tails independently in float64. Tails below its
    subnormal range underflow to zero before later gradient scaling, even
    when an exact tail times a large state would be representable.
    """
    states, actions, weights = [np.asarray(value, float) for value in (states, actions, weights)]
    bias = float(bias)
    with np.errstate(over='ignore', invalid='ignore', under='ignore'):
        logits = states @ weights + bias
        if np.isnan(logits).any():
            raise FloatingPointError('Indeterminate imitation logits')
        p = np.exp(-np.logaddexp(0., -logits))
        q = np.exp(-np.logaddexp(0., logits))
        slope = (1-2*actions)*p*q
        loss = float(np.where(actions == 1, q, p).mean())
        contributions = states*slope[:, None]
        scale = np.max(np.abs(contributions), axis=0)
        scaled = np.divide(contributions, scale, out=np.zeros_like(contributions), where=scale != 0)
        grad_w, grad_b = scaled.mean(axis=0)*scale, float(slope.mean())
    if not all(np.isfinite(value).all() for value in (p, loss, grad_w, grad_b)):
        raise FloatingPointError('Imitation result exceeds float64 range')
    return dict(probabilities=p, loss=loss, grad_w=grad_w, grad_b=grad_b)
