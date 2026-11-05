# REINFORCE in a Real Environment

Collect CartPole episodes, compute returns, and perform policy updates with honest evaluation.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** rl-02_trajectory.

## What You Will Be Able to Do

- Compute reward-to-go
- Separate termination and time-limit truncation
- Run and evaluate on-policy CartPole learning

## A complete loop

Reset the environment with a recorded seed, observe s, sample an action from the current policy, step the environment, and store the chosen-action log probability and reward. Stop on either terminated or truncated. CartPole-v1 terminates when the pole or cart leaves its allowed range and truncates at its time limit. A time limit is not inherently a physical terminal state; value-bootstrapped algorithms must treat that distinction carefully.

Compute G_t=r_t+gamma*G_(t+1) backward from the last reward. For the objective E[sum_t gamma^t r_t], the exact episodic score-function form uses gamma^t*G_t at time t. Our lab includes this outer factor. Many practical implementations use different weighting conventions; name the objective rather than mixing formulas. The loss to minimize is minus the mean across episodes of the sum of log probabilities times these discounted advantages.

## Learning and evaluating are different modes

A baseline may use a running return estimate from previous episodes or a learned state-value function; detach it in the policy loss. Normalizing advantages can stabilize practical training but changes the finite-sample estimator, so disclose it. Reward-to-go reduces irrelevant past-reward variance. Entropy bonuses can encourage exploration but can also reduce short-term reward.

The notebook uses Gymnasium's established CartPole physics, a small Torch policy, real sampled rollouts, and real backward/optimizer steps. It reports pre/post evaluation on fixed separate seeds, episode lengths, and every training seed. The default short run proves the pipeline executes; it does not promise to solve CartPole. No graphical display or GPU is required. Increase the episode budget as an experiment, not a hidden requirement for the browser challenge.

## Worked Example: Reward-to-go

Rewards=[1,0,2], gamma=.5.

1. **Last step:** G2=2.
2. **Middle:** G1=0+.5*2=1.
3. **First:** G0=1+.5*1=1.5. The objective weights for the score terms are [1.5,.5,.5] after multiplying by gamma^t.

Relative reward-to-go and the full discounted-objective weighting are not identical arrays.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Episodic discounted REINFORCE objective."""
import numpy as np

def discounted_returns(rewards, gamma):
    """Return G_t=sum_{k>=t} gamma^(k-t)*r_k for finite 1D rewards.

Require finite 0<=gamma<=1, else ValueError. Empty sequence returns empty."""
    raise NotImplementedError('Implement this function, then run the checks.')

def reinforce_loss(log_probabilities, rewards, mask, gamma=1.0, baseline=0.0):
    """Mean episode loss for discounted initial-state return.

Matching [B,T] log probabilities/rewards and Boolean mask. Masks are
nonempty true prefixes followed by padding. Assume finite valid arrays.
L=-mean_b sum_t gamma^t*logp_bt*(G_bt-baseline). Baseline is a fixed scalar,
not differentiated. Ignore all padding; do not average across token count."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Rewards=[1,1,1], gamma=1.

- Return at time 0

<details><summary>Worked answers</summary>

- 3: All three undiscounted rewards count.

</details>

## Experiment

Run `experiments/rl_cartpole.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare evaluation before and after actual updates on separate seeds. Report reward distributions, not just a maximum.
- Map CartPole state/action/episode/reward to text prefix/next token/completion/verifier score. The mathematics transfers; the environment and failure modes differ.

## Transfer Problems

1. Compare a running baseline with zero baseline at equal sampled transitions.
2. Replace dense step rewards with a sparse success reward and measure variance.

For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.

## AI-Assisted Coding Route

1. Predict the worked example and one edge case without assistance.
2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.
3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.
4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.
5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.
6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.

## Completion Evidence

A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.

## Primary Source

[Gymnasium: CartPole](https://gymnasium.farama.org/environments/classic_control/cart_pole/). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

