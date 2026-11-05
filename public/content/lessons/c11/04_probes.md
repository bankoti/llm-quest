# Probes, Frequencies, and Ablations

Read representations, then intervene before claiming a mechanism.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** dynamics-03_modular.

## What You Will Be Able to Do

- Fit a frozen linear probe
- Decompose activation grids into frequencies
- Compare restricted and excluded predictions

## Readable information is not necessarily used information

A linear probe maps fixed hidden features H [N,D] to labels or targets. Freeze H and fit only the probe on a training subset, then evaluate on held-out rows. A high probe score shows decodability under that probe and split. It does not prove the original model used the decoded information, nor that a neuron has a unique semantic meaning. Label shuffling and simple baselines help expose overfitting.

For a modular-addition model, record one neuron over all a,b pairs as a p-by-p grid. A diagonal or periodic pattern suggests a hypothesis. Apply a two-dimensional discrete Fourier transform to quantify frequency components instead of relying only on color. A real grid has conjugate-symmetric coefficients; keep conjugate pairs if an inverse transform must remain real.

## Restricted and excluded components

Given a declared frequency mask, reconstruct selected components by zeroing all other Fourier coefficients. The excluded reconstruction retains the complement. Their sum must recover the original grid. In this lab the grid can be an activation or a logit slice. Restricted loss uses predictions built only from selected components; excluded loss uses the complement. Compute loss against the same held-out targets and document which tensor was altered.

In the grokking case study, circuit-specific progress measures exposed changes not obvious from accuracy alone. Our generic Fourier filter teaches the intervention mechanics, not an automatic discovery of that circuit in any model. A low restricted loss with high excluded loss supports the importance of the chosen component under the intervention; distribution shift and nonlinear downstream compensation still limit causal claims.

## Worked Example: A reconstructable intervention

Grid = constant component + oscillating component.

1. **Select DC:** The [0,0] Fourier coefficient captures the grid mean.
2. **Restrict:** Keeping only DC reconstructs a constant grid at that mean.
3. **Exclude:** Removing DC reconstructs the zero-mean oscillation. Restricted plus excluded equals the original.

State exactly what you remove, and test reconstruction before interpreting a loss change.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Frozen linear probes and explicit Fourier interventions."""
import numpy as np

def fit_probe(features, targets, ridge=0.0):
    """Fit W [D,K] to finite features [N,D], targets [N,K], no intercept.

Minimize ||HW-Y||^2 + ridge*||W||^2. ridge>=0; otherwise ValueError.
Return the minimum-norm solution when ridge=0. No feature updates."""
    raise NotImplementedError('Implement this function, then run the checks.')

def fourier_parts(grid, keep):
    """Return (restricted, excluded) complex inverse-FFT grids.

grid finite 2D, keep matching Boolean mask. Complex results are intentional:
nonsymmetric masks need not reconstruct real signals. Their sum must equal
grid. Do not discard imaginary parts or modify inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A grid is [[1,3],[5,7]]. Keep only its DC frequency.

- Every reconstructed cell

<details><summary>Worked answers</summary>

- 4: The DC-only reconstruction is the mean: 16/4=4.

</details>

## Experiment

Run `experiments/dynamics_modular.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Measure a held-out probe on frozen features, and compare with shuffled-label training.
- Fourier energy is descriptive; the experiment prints reconstruction error and component-loss changes separately.

## Transfer Problems

1. Test a probe on random features with more dimensions than training examples.
2. Design an intervention that distinguishes correlation from actual use of a feature.

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

