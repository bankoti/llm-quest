# The Clipped Group-Relative Objective

Implement old-policy ratios, signed clipping, group advantages, masks, and reference KL.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** rl-03_reinforce.

## What You Will Be Able to Do

- Compute the full component objective
- Separate old policy from reference policy
- Compare actual vanilla and clipped updates

## Three policies have different jobs

The current policy is optimized. The old rollout policy generated the sampled completions and is fixed during their update epochs. A separate frozen reference policy anchors drift, often to an SFT checkpoint. The importance ratio is exp(logp_current-logp_old), not exp(logp_current-logp_reference). Refreshing old probabilities inside each update removes the intended trust-region comparison.

For rewards R_i within one prompt group, A_i=(R_i-mean(R))/(population_std(R)+1e-8). With outcome rewards this scalar is shared across valid response tokens. The surrogate is min(ratio*A, clip(ratio,1-epsilon,1+epsilon)*A). The minimum must be taken after multiplying by signed advantages: negative advantages reverse which ratio direction is harmful.

## Normalize and regularize explicitly

The lab follows the original per-response then per-group averaging: mean_i mean_valid_tokens [surrogate-beta*KL_sample]. Loss is its negative. Variable response lengths therefore receive equal response-level weight. Padding and prompt tokens must not enter these means. Reject a response with no valid target tokens.

The nonnegative sampled KL term is exp(logp_reference-logp_current)-(logp_reference-logp_current)-1. Under samples from the current policy its expectation estimates KL(current||reference); with old-policy rollouts it is used within a surrogate update, not an exact on-policy KL measurement at arbitrary drift. Equal-reward groups have zero task advantages, although KL can still act. The notebook performs actual updates on a tiny categorical task, comparing vanilla REINFORCE and clipped group updates at a disclosed sample budget. Neither method is a universal winner.

## Worked Example: Clipping depends on advantage sign

ratio=1.4 and epsilon=.2.

1. **Positive advantage:** With A=2, min(2.8,2.4)=2.4: further increasing a rewarded action is clipped.
2. **Negative advantage:** With A=-2, min(-2.8,-2.4)=-2.8: the harmful increase remains penalized.
3. **Different reference:** A reference-policy probability affects KL, not this old-policy ratio.

Clipping the final loss or taking an absolute advantage implements a different algorithm.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""One prompt group, original response-weighted clipped GRPO surrogate."""
import numpy as np

def clipped_grpo(logp, old_logp, reference_logp, rewards, mask, epsilon=0.2, beta=0.01):
    """Return dict loss, advantages, ratios, kl, clip_fraction.

Log arrays finite [G,T], rewards finite [G], Boolean mask [G,T]. G>=2;
each response has >=1 valid token. 0<epsilon<1, beta>=0; invalid: ValueError.
Population std with +1e-8. Loss=-mean_G(mean_valid(min(r*A,clip(r)*A)-beta*KL)).
KL=exp(reference_logp-logp)-(reference_logp-logp)-1. Padded entries in
ratios/kl are zero, and must not be exponentiated. clip_fraction is the
fraction of valid ratios outside [1-epsilon,1+epsilon]. No input mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Rewards=[1,3]. Use population standard deviation and ignore tiny epsilon for this calculation.

- Advantage of reward 3

<details><summary>Worked answers</summary>

- 1: Mean=2, std=1, so advantage=(3-2)/1=1.

</details>

## Experiment

Run `experiments/rl_group_updates.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Report sampled trajectories, optimizer steps, reward, KL, clipping fraction, and seed for each method.
- The browser challenge verifies the objective; the notebook verifies gradients and real policy changes. It is not a language-model benchmark reproduction.

## Transfer Problems

1. Compare response-weighted and token-weighted objectives on unequal lengths.
2. Freeze an incorrect old policy and predict how the ratio test will fail.

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

[DeepSeekMath: GRPO](https://arxiv.org/html/2402.03300v3#S4.SS1.SSS1). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

