# From Trajectory Probability to Policy Gradient

Derive the score-function estimator and verify it on an enumerable environment.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** rl-01_policy.

## What You Will Be Able to Do

- Compute log trajectory probabilities
- Use the log-derivative identity
- Explain why model-free gradients need no transition derivative

## Multiply probabilities, add log probabilities

A trajectory probability factors into an initial-state probability, policy action probabilities, and environment transitions. For a fixed environment whose dynamics do not depend on policy parameters, only the policy factors contribute to the parameter derivative of log probability. Thus grad log P(trajectory)=sum_t grad log pi(a_t|s_t). This is why a policy network can be trained model-free: it need not learn or differentiate an environment-transition model.

For Bernoulli sigmoid policies, the chosen-action log probability is a*log(p)+(1-a)*log(1-p), and its logit derivative is a-p. A length-100 trajectory with action probability .5 at each step has probability 2^-100, about 7.9e-31. Sum stable log probabilities instead of multiplying many small numbers. The environment probability factors cancel from the score derivative, not from the actual distribution of sampled trajectories. In code, select z for action 1 or -z for action 0 and evaluate -logaddexp(0,-selected_z), avoiding zero times an unchosen infinite log probability. Compute both sigmoid tails independently and select score q for action 1 or -p for action 0. Promote integer inputs before arithmetic; sum scores over time. NaN computed logits or nonfinite accumulated outputs raise FloatingPointError, and float64 tail underflow can precede feature scaling.

## The expectation supplies the learning signal

Let J(theta)=sum_tau P_theta(tau) R(tau). Differentiate: grad J=sum_tau R(tau) grad P_theta(tau)=sum_tau P_theta(tau) R(tau) grad log P_theta(tau). Sampling on-policy trajectories therefore estimates the gradient with return times the summed score. Treat sampled states/actions/rewards as fixed during this estimator; do not backpropagate through a discrete action sample.

A reward obtained at the end supplies weak information about many earlier decisions. The estimator can have high variance, especially with long trajectories or rare successes. A state-dependent baseline independent of the sampled action can reduce variance without changing the expectation under appropriate sampling. The lab and experiment enumerate a two-action sequence, compute the exact expected-return derivative, and compare Monte Carlo and finite-difference estimates.

## Worked Example: Two actions

Action probabilities are .8 and .25 for the actions actually taken; final reward is 3.

1. **Probability:** Conditional action product=.8*.25=.2. Environmental factors are omitted only in this fixed-transition toy.
2. **Log probability:** log(.8)+log(.25)=log(.2), about -1.609.
3. **Gradient contribution:** Multiply the sum of chosen-action score gradients by 3. Do not multiply the score vectors together.

The product rule becomes a sum of score terms after taking a logarithm.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Stable Bernoulli trajectory log probability and score gradient."""
import numpy as np

def trajectory_score(states, actions, weights, bias):
    """Return (log action-probability product, grad_w, grad_b).

states [T,D], actions binary [T], weights [D], finite bias. Valid inputs
assumed; T may be zero. Environment factors are not included. Sum scores
over time. Compute in floating point, including for integer inputs.
Stable for extreme logits, including signed infinite logits from overflow
when the selected actions have representable log probabilities and scores.
Raise FloatingPointError for NaN logits or nonfinite computed log
probability or gradients in float64. Do not mutate inputs.
Evaluate both sigmoid tails independently in float64. Tails below its
subnormal range underflow to zero before later score-gradient scaling,
even when an exact tail times a large state would be representable."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Four chosen actions each have probability .5.

- Action probability product

<details><summary>Worked answers</summary>

- 0.0625: (.5)^4=1/16.

</details>

## Experiment

Run `experiments/rl_gradients.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The exact enumerable objective should agree with finite differences; Monte Carlo estimates vary with samples and seeds.
- A neural policy is still model-free when it does not model environment transitions.

## Transfer Problems

1. Add a constant baseline and verify unchanged exact expectation.
2. Construct a sparse terminal reward and measure estimator variance as horizon grows.

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

[Sutton and Barto: Policy Gradient Methods](https://web.stanford.edu/class/psych209/Readings/SuttonBartoRL.pdf). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
