"""Exact expected-return gradient versus Monte Carlo and finite differences."""
from itertools import product
import json
import numpy as np
import torch


def gradient_experiment():
    states = torch.tensor([[1., -1.], [.5, 2.]], dtype=torch.float64)
    theta = torch.tensor([.3, -.2], dtype=torch.float64, requires_grad=True)
    labels = torch.tensor([1., 0.], dtype=torch.float64)
    p = torch.sigmoid(states@theta)
    imitation = (p-labels).abs().mean()
    imitation.backward()
    hand = states.T@((1-2*labels)*p.detach()*(1-p.detach()))/2
    assert torch.allclose(theta.grad, hand)
    theta.grad = None

    def expected_return(weight):
        probabilities = torch.sigmoid(states@weight)
        total = torch.zeros((), dtype=torch.float64)
        for actions in product([0, 1], repeat=2):
            action = torch.tensor(actions)
            likelihood = torch.where(action.bool(), probabilities, 1-probabilities).prod()
            reward = float(actions == (1, 0))
            total = total + likelihood*reward
        return total
    objective = expected_return(theta); objective.backward()
    exact = theta.grad.detach().numpy()
    finite = []
    for i in range(2):
        delta = torch.eye(2, dtype=torch.float64)[i]*1e-5
        finite.append(float(((expected_return(theta.detach()+delta)-expected_return(theta.detach()-delta))/(2e-5))))
    assert np.allclose(exact, finite, atol=1e-8)
    rng = np.random.default_rng(8); prob = torch.sigmoid(states@theta.detach()).numpy()
    actions = (rng.random((20000, 2)) < prob).astype(float)
    reward = ((actions[:, 0] == 1) & (actions[:, 1] == 0)).astype(float)
    scores = (actions-prob)@states.numpy()
    estimates = reward[:, None]*scores
    baseline_estimates = (reward-float(objective.detach()))[:, None]*scores
    # A simple compounding-error model: independent local correctness q over H steps.
    rollout = [{'offline_action_accuracy': q, 'horizon': h, 'all_actions_correct_probability': q**h} for q in [.9,.99] for h in [5,50]]
    return dict(exact_gradient=exact.tolist(), finite_difference=finite,
        monte_carlo=estimates.mean(0).tolist(), samples=len(actions),
        raw_variance=estimates.var(0).tolist(), baseline_variance=baseline_estimates.var(0).tolist(),
        imitation_gradient=hand.tolist(), rollout_shift_toy=rollout,
        limitation='The q^H toy assumes independent local errors; real distribution shift can be more complex.')


if __name__ == '__main__':
    print(json.dumps(gradient_experiment(), indent=2))
