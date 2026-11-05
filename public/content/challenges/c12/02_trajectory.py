# Generated starter; edit the functions in the course editor or notebook.
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
even when an exact tail times a large state would be representable."""
    raise NotImplementedError('Implement this function, then run the checks.')
