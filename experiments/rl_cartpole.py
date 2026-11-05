"""Real Gymnasium CartPole rollouts and REINFORCE updates on CPU.

uv run --with numpy --with torch --with gymnasium python experiments/rl_cartpole.py
No rendering dependency. Default 60 episodes is an execution study, not a solve.
"""
import json
import os
import gymnasium as gym
import numpy as np
import torch
from torch import nn


def cartpole_experiment(episodes=60):
    torch.set_num_threads(1)
    reports = []
    for seed in [4, 13]:
        torch.manual_seed(seed)
        policy = nn.Sequential(nn.Linear(4, 16), nn.Tanh(), nn.Linear(16, 2))
        optimizer = torch.optim.Adam(policy.parameters(), lr=.008)
        env = gym.make('CartPole-v1')
        def evaluation():
            lengths = []
            for eval_seed in [1001,1002,1003,1004,1005]:
                state, _ = env.reset(seed=eval_seed); count = 0
                while True:
                    with torch.no_grad():
                        action = int(policy(torch.tensor(state)).argmax())
                    state, _, terminated, truncated, _ = env.step(action); count += 1
                    if terminated or truncated:
                        break
                lengths.append(count)
            return lengths
        before = evaluation(); curve = []; baseline = 0.; sampled_transitions = 0
        initial_parameters = [p.detach().clone() for p in policy.parameters()]
        for episode in range(episodes):
            state, _ = env.reset(seed=seed*1000+episode)
            logps, rewards = [], []
            while True:
                distribution = torch.distributions.Categorical(logits=policy(torch.tensor(state)))
                action = distribution.sample()
                logps.append(distribution.log_prob(action))
                state, reward, terminated, truncated, _ = env.step(int(action)); rewards.append(reward)
                if terminated or truncated:
                    break
            gamma = .99; running = 0.; returns = []
            for reward in reversed(rewards):
                running = reward + gamma*running; returns.append(running)
            returns = torch.tensor(list(reversed(returns)))
            weights = gamma**torch.arange(len(rewards))
            loss = -(torch.stack(logps)*weights*(returns-baseline)).sum()
            optimizer.zero_grad(set_to_none=True); loss.backward()
            torch.nn.utils.clip_grad_norm_(policy.parameters(), 10.); optimizer.step()
            baseline = .9*baseline+.1*float(returns.mean())
            sampled_transitions += len(rewards)
            curve.append(len(rewards))
        after = evaluation(); env.close()
        assert any(not torch.equal(a,b) for a,b in zip(initial_parameters,policy.parameters()))
        reports.append(dict(seed=seed, episodes=episodes, sampled_transitions=sampled_transitions,
            before_eval_lengths=before, after_eval_lengths=after, training_lengths=curve,
            before_mean=float(np.mean(before)), after_mean=float(np.mean(after)),
            limitation='Greedy evaluation on five fixed seeds; no claim of solving the environment. No truncation bootstrap in this finite-episode Monte Carlo objective.'))
    return reports


if __name__ == '__main__':
    print(json.dumps(cartpole_experiment(int(os.environ.get('CARTPOLE_EPISODES', '60'))), indent=2))
