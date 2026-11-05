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
Raise FloatingPointError for NaN logits or nonrepresentable returned log
probability or gradients. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
