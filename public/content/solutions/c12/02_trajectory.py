"""Stable Bernoulli trajectory log probability and score gradient."""
import numpy as np


def trajectory_score(states, actions, weights, bias):
    """Return (log action-probability product, grad_w, grad_b).

    states [T,D], actions binary [T], weights [D], finite bias. Valid inputs
    assumed; T may be zero. Environment factors are not included. Sum scores
    over time. Compute in floating point, including for integer inputs.
    Stable for extreme logits. Do not mutate inputs.
    """
    states, actions, weights = [np.asarray(value, float) for value in (states, actions, weights)]
    bias = float(bias)
    logits = states @ weights + bias
    logp = -np.logaddexp(0., -logits)
    log1p = -np.logaddexp(0., logits)
    p = np.exp(logp)
    scores = actions-p
    return float((actions*logp+(1-actions)*log1p).sum()), states.T@scores, float(scores.sum())
