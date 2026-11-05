# Residual Networks as Compositions

Count routes through skip connections without pretending nonlinear blocks are linear.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** backpropagation.

## What You Will Be Able to Do

- Count path lengths
- Expand a linear residual network
- Separate identity routes from learned residuals

## Depth can hurt optimization, not just generalization

A plain network composes learned maps: x_next=F(x). A residual block instead computes x_next=x+F(x). A deeper plain model can have worse training error even though it can in principle express the shallower solution. This is optimization degradation, distinct from overfitting, where training error is low but held-out error is high. The original ResNet experiments motivated learning changes to a representation rather than replacing it at every block.

The residual stream is the running x. Its identity route carries information and gradients, while F can add a useful correction. Normalization, initialization, width, activation choice, and optimizer still matter. A skip connection does not guarantee good gradients or convergence for arbitrary weights. Compare training and validation losses, not a single claim that deep always wins.

## Count paths carefully

For L additive blocks there are 2^L choices of taking the identity or transformed branch. Exactly choose(L,k) routes use k transformed branches. This combinatorial picture is useful for reasoning about ablations, but paths share parameters and are not independently trained ensemble members.

If every F_i is linear, the overall map is (I+W_L)...(I+W_1). For two blocks this is I+W_1+W_2+W_2 W_1. Order matters: W_2 W_1 generally differs from W_1 W_2. For nonlinear F, F_2(x+F_1(x)) cannot generally be split into F_2(x)+F_2(F_1(x)). The lab returns path counts and evaluates both plain and residual chains of linear matrices, with an independent nonlinear counterexample in the experiment.

## Worked Example: Unravel two linear blocks

Scalar x=2, W1=3, W2=4.

1. **Direct evaluation:** First block: 2+3*2=8. Second: 8+4*8=40.
2. **Path expansion:** Identity 2, first-only 6, second-only 8, both 24. Their sum is 40.
3. **Do not overgeneralize:** Replace W2 by squaring: (x+3x)^2 is not x^2+(3x)^2; cross terms matter.

The path count is combinatorial; a linear algebraic expansion has additional assumptions.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Linear residual-chain mechanics; not a nonlinear ensemble identity."""
from math import comb
import numpy as np

def path_counts(depth):
    """Return counts for k=0..depth transformed branches. Reject invalid depth."""
    raise NotImplementedError('Implement this function, then run the checks.')

def linear_chain(x, matrices, residual=True):
    """Apply [D,D] matrices to column vector x [D] in list order.

In residual mode x <- x+W@x; otherwise x <- W@x. Valid finite shapes
assumed. Return a fresh array even for no blocks; do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A network has 5 additive residual blocks.

- Routes with exactly two transformed branches
- All routes

### Worked Answers

- 10: Choose(5,2)=5*4/2=10.
- 32: Each of 5 blocks offers 2 branches: 2^5.

## Experiment

Run `experiments/dynamics_depth.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare matched-width plain/residual networks at several depths, logging training loss and layer-gradient norms.
- Finite seeds and an identity-like target favor some architectures. Repeat on a nonlinear target before generalizing.

## Transfer Problems

1. Construct two noncommuting 2x2 matrices and show why path order matters.
2. Explain why ablating a shared block is not equivalent to deleting one independent ensemble model.

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

[Deep Residual Learning](https://arxiv.org/abs/1512.03385). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
