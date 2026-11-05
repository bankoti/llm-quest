# Generated starter; edit the functions in the course editor or notebook.
"""Explicit linear latent rollouts and goal costs."""
import numpy as np

def plan_candidates(initial, dynamics_a, dynamics_b, candidates, goal, action_penalty=0.0):
    """Return (first best index, costs [C], predicted states [C,H,D]).

z_next=A@z+B@action. initial/goal [D], A [D,D], B [D,U], candidates [C,H,U].
Valid finite shapes C,H>=1 and nonnegative penalty assumed. Cost sums goal
squared distance at EVERY predicted step plus penalty*sum(action^2).
No input mutation. This function does not impose action bounds."""
    raise NotImplementedError('Implement this function, then run the checks.')
