# Generated starter; edit the functions in the course editor or notebook.
"""Binary sigmoid policy and L1 imitation gradients."""
import numpy as np

def imitation_l1(states, actions, weights, bias):
    """Return dict probabilities, loss, grad_w, grad_b.

states finite [N,D], binary actions [N], weights [D], scalar bias; N>0.
Mean L1 between sigmoid probabilities and binary expert actions.
Assume valid shapes/values. Stable at extreme logits; no input mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')
