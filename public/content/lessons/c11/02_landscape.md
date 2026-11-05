# Measure a Loss Landscape

Sweep declared parameter directions and distinguish a slice from the full optimization problem.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** dynamics-01_paths.

## What You Will Be Able to Do

- Evaluate a two-direction parameter slice
- Calculate numerical slopes
- Control depth comparisons

## A plot is a slice, not the whole space

A model with millions of parameters has a loss surface in millions of dimensions. A two-dimensional image fixes a center theta and two directions u,v, then evaluates L(theta+a*u+b*v). Changing the direction scale changes the apparent sharpness. Label the center, directions, normalization, data split, and axes. A smooth slice does not prove every direction is smooth.

The coding lab uses a two-layer scalar regression yhat=w2*tanh(w1*x). Given data x,y and a grid of w1,w2, compute mean squared error for each pair. Rows index w1; columns index w2. This deliberately inspectable model supports a real parameter sweep rather than a hand-drawn hill. The finite-difference gradient perturbs each weight by plus/minus epsilon and divides the loss difference by 2*epsilon.

Convert x, y, and both weight grids to floating point before multiplying or squaring. For example, int8 arithmetic turns 64*2 into -128, reversing the tanh response before the loss is measured. Promotion prevents integer wrapping; the resulting real-valued products and losses still need to fit the float64 range.

## Design the depth experiment

For plain versus residual networks, keep the dataset, width, optimizer, learning rate, update count, and random seeds recorded. Equal width at different depth does not imply equal parameter count or compute. Report those differences. Inspect gradients near the input and output before claiming vanishing gradients; poor optimization can have more than one cause.

Layerwise sweeps vary only one layer while holding all other layers fixed. They answer a conditional question, not what training would find after jointly adapting every layer. Randomly rescaled directions and differently normalized layers can manufacture a visual sharpness difference. The experiment therefore reports numbers and axis definitions for plotting.

## Worked Example: A central difference

L(w+0.01)=0.54 and L(w-0.01)=0.50.

1. **Subtract:** The loss difference is 0.04.
2. **Divide:** The parameter separation is 0.02, so the estimated derivative is 2.
3. **Interpret:** A small negative update should reduce this local loss, but a large step may leave the local regime.

Finite differences estimate local sensitivity; they do not establish a global optimum.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Measured slices for yhat=w2*tanh(w1*x)."""
import numpy as np

def landscape(x, y, first_weights, second_weights):
    """Return MSE grid [len(first_weights),len(second_weights)].

Finite nonempty 1D x,y of equal length and finite 1D weight grids assumed.
Rows vary w1, columns vary w2. Average over examples only."""
    raise NotImplementedError('Implement this function, then run the checks.')

def numerical_gradient(loss, theta, epsilon=1e-05):
    """Central-difference gradient of scalar callable loss at 1D theta.

Positive finite epsilon, finite theta assumed. Do not mutate theta."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

L(w+0.001)=1.003 and L(w-0.001)=0.997.

- Central-difference slope

### Worked Answers

- 3: (1.003-.997)/.002=3.

## Experiment

Run `experiments/dynamics_depth.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The experiment measures actual optimization and gradient norms, not a promised universal residual-network advantage.
- Vary one layer and compare the same fixed data; label direction normalization.

## Transfer Problems

1. Halve epsilon twice and inspect numerical-gradient stability.
2. Compare training and validation slices around the same checkpoint.

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

[Visualizing the Loss Landscape of Neural Nets](https://arxiv.org/abs/1712.09913). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
