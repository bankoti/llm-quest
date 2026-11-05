# Predict Representations, Not Every Pixel

Separate JEPA-family mechanisms, collapse controls, and multimodal uncertainty.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** embodied-03_actions.

## What You Will Be Able to Do

- Compute latent prediction loss
- Update an EMA target correctly
- Distinguish EMA designs from end-to-end regularized variants

## Why the average future can be blurry

When the same context permits two different future images, a deterministic pixel-MSE predictor minimizes expected loss by predicting their conditional mean. If an object can move left or right, the mean can contain a faint object in both places rather than one plausible future. A generative distribution can represent multiple futures; a latent predictor can instead focus on features that are useful and predictable. Neither choice removes uncertainty automatically.

A joint-embedding predictive architecture encodes context and targets, then predicts target representations from context, sometimes conditioned on an action or mask. This differs from a joint-embedding similarity objective and from reconstructing every target pixel. The representation must retain what the downstream task needs; discarding unpredictable detail can also discard something important for control.

## The target branch is a design choice

One common design uses a stop-gradient target encoder updated by exponential moving average: target <- momentum*target+(1-momentum)*online. Gradients train the online encoder and predictor, not the target through that loss. The browser lab computes masked latent MSE and a nonmutating EMA update. This teaches that design, not a universal definition of JEPA.

LeWorldModel uses a different end-to-end recipe: next-embedding prediction plus SIGReg, which encourages Gaussian-like latent distributions through random projections. It does not require EMA or stop-gradient. Our toy variance regularizer is not SIGReg. The comparison notebook labels these differences explicitly and treats collapse diagnostics, prediction error, and downstream planning success as distinct tests.

## Worked Example: Update a slowly moving target

Old target weight=2, online weight=6, momentum=.9.

1. **Retain history:** .9*2=1.8.
2. **Add online contribution:** .1*6=.6.
3. **New target:** 1.8+.6=2.4. The target did not take a direct optimizer step through this loss.

Write down the gradient paths and update rules; similar architecture diagrams can train differently.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Masked latent prediction and EMA target mechanics."""
import numpy as np

def latent_mse(prediction, target, mask):
    """Mean squared feature error over selected [B,T] target positions.

prediction/target matching finite [B,T,D], Boolean mask [B,T]. Reject
mismatched shapes, nonfinite values, or empty mask with ValueError.
Average over selected positions AND D features. Do not mutate arrays.
Convert prediction and target to floating point before arithmetic."""
    raise NotImplementedError('Implement this function, then run the checks.')

def ema_target(target, online, momentum):
    """Return fresh m*target+(1-m)*online. Matching finite arrays assumed.

Require finite 0<=momentum<=1, else ValueError. No input mutation.
This is an update rule, not proof of noncollapse."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Two equally likely scalar futures are -2 and +2 under squared error.

- Optimal deterministic prediction

<details><summary>Worked answers</summary>

- 0: The conditional mean is 0, even though neither actual future equals 0.

</details>

## Experiment

Run `experiments/embodied_world.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare an ambiguous pixel mean with a distribution over distinct futures.
- The toy world experiment uses fixed observations and learned dynamics; it does not claim to reproduce end-to-end LeWorldModel representation learning.

## Transfer Problems

1. Draw which arrays receive gradients in an EMA-target design and in a jointly trained regularized design.
2. Give a task where averaging away an unpredictable feature would be harmful.

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

[Revisiting Feature Prediction from Video](https://arxiv.org/abs/2404.08471). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [LeWorldModel](https://arxiv.org/abs/2603.19312)
