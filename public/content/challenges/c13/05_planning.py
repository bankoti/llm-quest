# Generated starter; edit the functions in the course editor or notebook.
"""Explicit linear latent rollouts and goal costs."""
import numpy as np

def plan_candidates(initial, dynamics_a, dynamics_b, candidates, goal, action_penalty=0.0):
    """Return (first best index, costs [C], predicted states [C,H,D]).

z_next=A@z+B@action. initial/goal [D], A [D,D], B [D,U], candidates [C,H,U].
Valid finite shapes C,H>=1 and nonnegative penalty assumed. Cost sums goal
squared distance at EVERY predicted step plus penalty*sum(action^2).
Convert numerical arrays to floating point before rollout and cost arithmetic.
Nonfinite active float64 intermediates raise FloatingPointError before selection.
A zero penalty skips action-effort arithmetic. With a positive penalty,
action squares and their sum must be finite even if scaling by a tiny
penalty could make the mathematical effort representable.
No input mutation. This function does not impose action bounds."""
    raise NotImplementedError('Implement this function, then run the checks.')
