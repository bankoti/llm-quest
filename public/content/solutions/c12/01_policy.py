"""Binary sigmoid policy and L1 imitation gradients."""
import numpy as np


def imitation_l1(states, actions, weights, bias):
    """Return dict probabilities, loss, grad_w, grad_b.

    states finite [N,D], binary actions [N], weights [D], scalar bias; N>0.
    Mean L1 between sigmoid probabilities and binary expert actions.
    Assume valid shapes/values. Stable at extreme logits; no input mutation.
    """
    logits = states @ weights + bias
    p = np.exp(-np.logaddexp(0., -logits))
    slope = (1-2*actions)*p*(1-p)
    return dict(probabilities=p, loss=float(np.abs(p-actions).mean()), grad_w=states.T@slope/len(states), grad_b=float(slope.mean()))
