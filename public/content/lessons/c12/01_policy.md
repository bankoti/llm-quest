# A Stochastic Policy and Its Gradient

Turn observations into action probabilities and derive an imitation update by hand.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** gradients, softmax-probabilities.

## What You Will Be Able to Do

- Compute a sigmoid decision boundary
- Differentiate L1 imitation loss
- Explain exploration and rollout shift

## Actions are sampled, not differentiable decisions

A binary policy sets p(action=1|s)=sigmoid(w dot s+b). Sampling chooses 1 with probability p and 0 otherwise. The p=0.5 decision boundary is w dot s+b=0. For CartPole the observation has cart position, cart velocity, pole angle, and angular velocity; the actions apply left or right force. A stochastic policy can explore alternatives, but randomness alone does not solve sparse rewards.

Imitation learning trains on labeled expert actions. For binary label y, L1 loss |p-y| equals 1 minus the probability assigned to the demonstrated action. Its derivative with respect to the logit is (1-2y)*p*(1-p). Multiply by each feature to obtain the weight gradient and average over examples. This differs from binary cross-entropy, whose logit derivative is p-y. Do not silently substitute one loss for the other.

## The deployed policy changes its own data

An imitation dataset comes from the expert's visited states. A small mistake can take the learned policy to a state absent from that dataset, where another mistake becomes more likely. This is rollout distribution shift. Evaluate complete trajectories, not only offline action accuracy. Reinforcement learning instead uses rewards from the learner's interaction, introducing exploration, variance, and credit-assignment problems.

The lab returns probabilities, mean L1 loss, and gradients for a batch. The notebook verifies them against autograd and finite differences. It also compares demonstration action accuracy with rollout reward in a deliberately small discrete task; the CartPole unit uses the real Gymnasium simulator. None of these tests authorizes control of physical hardware.

## Worked Example: One sigmoid update

s=[2,-1], w=[0,0], b=0, expert action y=1.

1. **Forward:** The logit is 0, p=.5, and L1=.5.
2. **Backward:** dL/dz=-.25. Thus dL/dw=[-.5,.25], dL/db=-.25.
3. **SGD:** At learning rate .1, w becomes [.05,-.025] and b becomes .025. The demonstrated action becomes more likely.

Differentiate the probability-based loss, not the sampled action.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Binary sigmoid policy and L1 imitation gradients."""
import numpy as np

def imitation_l1(states, actions, weights, bias):
    """Return dict probabilities, loss, grad_w, grad_b.

states finite [N,D], binary actions [N], weights [D], scalar bias; N>0.
Mean L1 between sigmoid probabilities and binary expert actions.
Assume valid shapes/values. Compute in floating point, including for
integer inputs. Stable at extreme logits; no input mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A demonstrated action is 0 and p(action=1)=0.8.

- L1 imitation loss

<details><summary>Worked answers</summary>

- 0.8: |.8-0|=.8; chosen-action confidence is .2.

</details>

## Experiment

Run `experiments/rl_gradients.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare hand gradients with central differences and autograd before training.
- The discrete rollout-shift example is not a CartPole physics substitute.

## Transfer Problems

1. Derive the cross-entropy gradient and compare saturation with L1.
2. Plot the boundary in pole-angle/angular-velocity space with other observations fixed.

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

[A Reduction of Imitation Learning and Structured Prediction](https://arxiv.org/abs/1011.0686). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

