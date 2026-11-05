# Double Descent and the Interpolation Threshold

Sweep capacity and noise using actual fitted predictors and untouched test data.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** dynamics-04_probes.

## What You Will Be Able to Do

- Fit minimum-norm and ridge predictors
- Measure model-wise interpolation
- Distinguish double descent from grokking

## Capacity changes the regime

Classical bias-variance intuition predicts an intermediate complexity sweet spot. Some overparameterized systems show a second improvement after a peak near the capacity needed to interpolate training data. This is model-wise double descent when capacity varies. Epoch-wise double descent varies training time instead. Neither curve is universal; noise, features, regularization, optimizer, and sample size matter.

For design matrix X [N,D] and targets y [N,K], the minimum-norm least-squares solution uses a pseudoinverse or an SVD-based least-squares solver. When D>N, many weight vectors may fit the training data; minimum norm chooses one. Ridge minimizes ||XW-y|| squared + lambda||W|| squared. Our implementation uses an augmented least-squares system, avoiding an explicit matrix inverse and working on both sides of the interpolation threshold.

For repeated training sets, average their fitted predictions at each fixed test point. Bias squared is the squared difference of that mean from noiseless truth. Variance is the mean squared deviation around that mean prediction. Averaged over test points, MSE equals bias squared plus variance; independent observation noise adds its own variance. Polynomial features [1,x,x^2,...,x^degree] let the experiment vary capacity, but high-degree monomial bases can be ill-conditioned.

Promote predictions and truth to float before subtraction and squaring, not only before taking a mean. In uint8, 200 squared wraps to 64 instead of 40000, which can break the MSE=bias2+variance check. The decomposition here assumes fixed noiseless truth and squared errors representable in float64.

## An honest sweep

Generate one teacher and disjoint train/test inputs. Add noise only according to a declared recipe. Sweep D around N using nested random features, fit on train, and report both train and test MSE over several seeds. Random-label experiments remove meaningful signal; near-zero training loss then indicates memorization, not useful learning. More data moves the interpolation threshold and can change the entire curve.

Grokking is delayed generalization along a training trajectory. Double descent is a nonmonotonic error pattern over capacity or time. They can share ingredients such as regularization but are not synonyms. A smooth monotonic curve in your small experiment is a valid result. Do not fabricate a peak or infer a universal scaling law from a single trial.

## Worked Example: Interpolation is not identification

One training row X=[1,1], target y=2.

1. **Many fits:** Any weights with w1+w2=2 fit perfectly, including [2,0] and [100,-98].
2. **Minimum norm:** [1,1] has the smallest squared norm among these fits.
3. **Held-out behavior:** For test x=[1,-1], these fits give 2,198, and 0 respectively. Equal training error does not imply equal generalization.

The solution-selection rule matters after the training constraints become underdetermined.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Least-squares capacity studies with a stable solver."""
import numpy as np

def ridge_fit(x, y, penalty=0.0):
    """Fit W [D,K] from X [N,D], Y [N,K], without an intercept.

Objective ||XW-Y||^2 + penalty*||W||^2. Nonnegative finite penalty required.
Assume nonempty finite arrays with compatible shapes. At zero penalty use
the minimum-norm solution, including rank-deficient and D>N designs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def bias_variance(predictions, truth):
    """Return bias2, variance, mse for predictions [runs,points] and truth [points].

Fixed noiseless truth; population variance over runs. MSE averages all runs
and points. Thus mse = bias2 + variance (no observation-noise term here).
Valid finite nonempty shapes assumed. Compute in floating point, including
for integer inputs. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

X=[1,1], y=2, minimum Euclidean norm.

- First fitted weight

### Worked Answers

- 1: Symmetry and the sum constraint give [1,1].

## Experiment

Run `experiments/dynamics_interpolation.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Print per-seed train/test MSE for capacities below, near, and above N, with and without ridge.
- The finite random-feature experiment is not a replication of deep-network benchmark curves.

## Transfer Problems

1. Repeat after doubling the number of training examples.
2. Increase label noise and examine the peak and the effect of regularization.

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

[Deep Double Descent](https://arxiv.org/abs/1912.02292). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
