"""Explicit linear latent rollouts and goal costs."""
import numpy as np


def plan_candidates(initial, dynamics_a, dynamics_b, candidates, goal, action_penalty=0.):
    """Return (first best index, costs [C], predicted states [C,H,D]).

    z_next=A@z+B@action. initial/goal [D], A [D,D], B [D,U], candidates [C,H,U].
    Valid finite shapes C,H>=1 and nonnegative penalty assumed. Cost sums goal
    squared distance at EVERY predicted step plus penalty*sum(action^2).
    No input mutation. This function does not impose action bounds.
    """
    states = np.repeat(np.asarray(initial)[None,:],len(candidates),axis=0)
    history = []
    for step in range(candidates.shape[1]):
        states = states@dynamics_a.T+candidates[:,step]@dynamics_b.T
        history.append(states.copy())
    rollout = np.stack(history,axis=1)
    costs = ((rollout-goal)**2).sum(axis=(1,2))+action_penalty*(candidates**2).sum(axis=(1,2))
    return int(np.argmin(costs)),costs,rollout
