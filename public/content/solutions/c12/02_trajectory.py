"""Stable Bernoulli trajectory log probability and score gradient."""
import numpy as np


def trajectory_score(states, actions, weights, bias):
    """Return (log action-probability product, grad_w, grad_b).

    states [T,D], actions binary [T], weights [D], finite bias. Valid inputs
    assumed; T may be zero. Environment factors are not included. Sum scores
    over time. Compute in floating point, including for integer inputs.
    Stable for extreme logits, including signed infinite logits from overflow
    when the selected actions have representable log probabilities and scores.
    Raise FloatingPointError for NaN logits or nonfinite computed log
    probability or gradients in float64. Do not mutate inputs.
    Evaluate both sigmoid tails independently in float64. Tails below its
    subnormal range underflow to zero before later score-gradient scaling,
    even when an exact tail times a large state would be representable.
    """
    states, actions, weights = [np.asarray(value, float) for value in (states, actions, weights)]
    bias = float(bias)
    with np.errstate(over='ignore', invalid='ignore', under='ignore'):
        logits = states @ weights + bias
        if np.isnan(logits).any():
            raise FloatingPointError('logits exceed the supported numeric range')
        selected_logits = np.where(actions == 1, logits, -logits)
        log_probability = float((-np.logaddexp(0., -selected_logits)).sum())
        p = np.exp(-np.logaddexp(0., -logits))
        q = np.exp(-np.logaddexp(0., logits))
        scores = np.where(actions == 1, q, -p)
        grad_w, grad_b = states.T@scores, float(scores.sum())
    if not np.isfinite(log_probability) or not np.isfinite(grad_w).all() or not np.isfinite(grad_b):
        raise FloatingPointError('trajectory outputs exceed the supported numeric range')
    return log_probability, grad_w, grad_b
