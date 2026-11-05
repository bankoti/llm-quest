# Generated starter; edit the functions in the course editor or notebook.
"""Stable Bernoulli trajectory log probability and score gradient."""
import numpy as np

def trajectory_score(states, actions, weights, bias):
    """Return (log action-probability product, grad_w, grad_b).

states [T,D], actions binary [T], weights [D], finite bias. Valid inputs
assumed; T may be zero. Environment factors are not included. Sum scores
over time. Stable for extreme logits. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
