"""Explicit linear latent rollouts and goal costs."""
import numpy as np


def plan_candidates(initial, dynamics_a, dynamics_b, candidates, goal, action_penalty=0.):
    """Return (first best index, costs [C], predicted states [C,H,D]).

    z_next=A@z+B@action. initial/goal [D], A [D,D], B [D,U], candidates [C,H,U].
    Valid finite shapes C,H>=1 and nonnegative penalty assumed. Cost sums goal
    squared distance at EVERY predicted step plus penalty*sum(action^2).
    Convert numerical arrays to floating point before rollout and cost arithmetic.
    Nonfinite active float64 intermediates raise FloatingPointError before selection.
    A zero penalty skips action-effort arithmetic. With a positive penalty,
    action squares and their sum must be finite even if scaling by a tiny
    penalty could make the mathematical effort representable.
    No input mutation. This function does not impose action bounds.
    """
    initial,dynamics_a,dynamics_b,candidates,goal = [np.asarray(value,float) for value in (initial,dynamics_a,dynamics_b,candidates,goal)]
    states = np.repeat(initial[None,:],len(candidates),axis=0)
    history = []
    with np.errstate(over='raise',invalid='raise'):
        for step in range(candidates.shape[1]):
            states = states@dynamics_a.T+candidates[:,step]@dynamics_b.T
            if not np.isfinite(states).all():
                raise FloatingPointError('nonfinite latent rollout')
            history.append(states.copy())
        rollout = np.stack(history,axis=1)
        costs = ((rollout-goal)**2).sum(axis=(1,2))
        if action_penalty != 0:
            costs = costs+action_penalty*(candidates**2).sum(axis=(1,2))
    if not np.isfinite(costs).all():
        raise FloatingPointError('nonfinite planning objective')
    return int(np.argmin(costs)),costs,rollout
