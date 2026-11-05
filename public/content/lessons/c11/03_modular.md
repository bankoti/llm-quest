# Modular Arithmetic and Delayed Generalization

Learn a cyclic rule and investigate grokking without fabricating a successful curve.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** dynamics-02_landscape, validation-generalization.

## What You Will Be Able to Do

- Construct modular-addition datasets
- Decode sums using clock features
- Distinguish fitting from delayed generalization

## A small finite world with a hidden rule

In addition modulo p, the answer to a+b is the remainder after division by p. For p=5, 4+3=7 becomes 2. There are p squared ordered input pairs. Split pairs before training and never move a pair between train and test after viewing the curve. A network can memorize observed pairs without learning an algorithm for unseen pairs.

Grokking names a delayed transition to generalization after fitting training data. It is an empirical phenomenon, not a mandatory phase of every neural network. Regularization, dataset fraction, architecture, learning rate, seed, and training duration all affect whether and when it appears. A short CPU run is a smoke test and must not be labeled a reproduction of a long delayed transition.

## Clock features express a reusable rule

Map a to angle theta_a=2*pi*a/p. The addition identities give cos(theta_a+theta_b)=cos(theta_a)cos(theta_b)-sin(theta_a)sin(theta_b), and sin(theta_a+theta_b)=sin(theta_a)cos(theta_b)+cos(theta_a)sin(theta_b). Match the resulting point to the p candidate clock points by dot product. The maximum is the modular sum, up to numerical ties.

The Nanda et al. case study analyzed a one-layer Transformer on modular addition and identified Fourier-based computations. Our clock decoder is an explicit constructive solution, while the training experiment uses a small neural network and measures its actual held-out behavior. Finding a successful hand-built circuit does not prove a trained network uses it; that requires activation analysis and interventions in the next unit.

## Worked Example: Wrap around a five-hour clock

a=4, b=3, p=5.

1. **Angles:** The angles add to 14*pi/5, equivalent modulo 2*pi to 4*pi/5.
2. **Decode:** Candidate 2 has angle 4*pi/5, so its dot product with the sum feature is 1.
3. **Compare learning:** A model trained on only some pairs must discover a transferable rule or another generalizing representation to answer withheld pairs.
4. **Research scale versus this lab:** The cited mainline study used modulus 113, one ReLU Transformer layer, width 128, four 32-wide heads, and a 512-wide MLP. It trained on 30% of pairs for 40,000 epochs. Our smaller MLP is a mechanism experiment, not that reproduction.

The algorithmic solution is simple; the path by which optimization finds it may not be.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Constructive clock circuit, separate from learning the circuit."""
import numpy as np

def clock_sum(a, b, modulus):
    """Return (2D sum feature, decoded ID) via trigonometric addition.

a,b are integers in [0,modulus), modulus integer >=2. Invalid: ValueError.
Feature is [cos(theta_a+theta_b), sin(theta_a+theta_b)], constructed from
separate sin/cos of a and b. Decode by candidate clock dot products."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Modulo 7, compute 6+5.

- Remainder

<details><summary>Worked answers</summary>

- 4: 11 = 1*7 + 4.

</details>

## Experiment

Run `experiments/dynamics_modular.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Run several seeds and retain every curve. The default is short; an optional longer step budget is needed to investigate delayed transitions.
- Separate the hand-coded clock circuit, trained-network accuracy, and mechanistic evidence. They are three different claims.

## Transfer Problems

1. Change the operation from addition to multiplication and explain why the same clock identity does not directly solve it.
2. Sweep training fraction while keeping the test pairs fixed across seeds.

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

[Progress Measures for Grokking](https://arxiv.org/abs/2301.05217). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

