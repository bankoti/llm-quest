# Self-Supervision Without Collapse

Calculate a redundancy-reduction objective and distinguish global features from dense spatial features.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** embodied-01_vision.

## What You Will Be Able to Do

- Diagnose constant representations
- Implement Barlow Twins correlation loss
- Explain the role of DINOv3 Gram anchoring

## Matching views has a trivial solution

Self-supervised learning creates training signals from data rather than requiring a human class label for every example. In vision, two augmentations of the same image can form a positive pair. If the only objective is to make their embeddings equal, an encoder that outputs the same constant for every image achieves zero distance while discarding information. Measure variance, covariance, and downstream usefulness, not only pairwise loss.

Barlow Twins standardizes each feature across the batch and forms cross-correlation C=Z_a.T@Z_b/N. Its objective sums (1-C_ii)^2 on the diagonal and lambda*C_ij^2 off the diagonal. Diagonal terms encourage matched-view agreement; off-diagonal terms reduce redundant features. Our lab uses population variance plus epsilon inside the square root. Constant features therefore produce zero correlation and a positive diagonal penalty rather than numerical NaNs.

Use the supplied _standardize_columns helper: subtract a reference row before taking the mean, so a huge shared offset does not erase a small representable spread. Keep those centered differences when finite; fall back to scaled original columns only if the differences, mean, or centered deviations overflow. Scale centered deviations before measuring standard deviation and combine the scaled standard deviation with sqrt(epsilon) in matching units using hypot. A valid epsilon is positive and finite in the original variance units; adding an unchanged epsilon after rescaling would define a different objective.

## Do not conflate anti-collapse recipes

Barlow Twins does not require an EMA teacher or stop-gradient by definition. Other self-distillation methods use teacher/student asymmetry, centering, sharpening, or additional objectives. The recipe matters: adding an EMA alone is not a mathematical guarantee against collapse. Test a constant-encoder negative control.

DINOv3 learns strong frozen visual features and addresses degradation of dense patch relationships during long training with Gram anchoring. A Gram matrix records pairwise feature similarities; matching such relations can preserve spatial structure even when global semantic objectives dominate. Our optional Gram-distance calculation illustrates that relation, not the complete DINOv3 training recipe or its benchmark results. Evaluate dense and global tasks separately before claiming one representation is better.

For cosine Gram distance, promote features to float and divide each nonzero row by its maximum absolute coordinate before L2 normalization. This avoids overflow or underflow in the norm without changing cosine similarities. Feature widths may differ between the two arrays, but patch counts must match; compare the resulting patch-by-patch Gram matrices.

## Worked Example: A perfect but redundant pair

Cross-correlation C=[[1,1],[1,1]], lambda=.1.

1. **Diagonal:** Both diagonal values equal 1, so invariance penalty is 0.
2. **Off diagonal:** Two off-diagonal entries each contribute .1*1 squared, totaling .2.
3. **Interpret:** The features agree across views but duplicate each other. C=I would have zero loss.

Agreement and information diversity are separate requirements.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Barlow Twins mechanism, not the complete training recipe."""
import numpy as np

def _standardize_columns(view, epsilon):
    """Standardize float columns, preserving finite reference differences."""
    view = np.asarray(view, float)
    root_epsilon = np.sqrt(epsilon)
    with np.errstate(over='ignore', invalid='ignore'):
        shifted = view - view[:1]
        shifted_mean = shifted.mean(0)
        centered = shifted - shifted_mean
    stable = np.isfinite(shifted).all(0) & np.isfinite(shifted_mean) & np.isfinite(centered).all(0)
    epsilon_units = np.full(view.shape[1], root_epsilon)
    if not stable.all():
        fallback = view[:, ~stable]
        fallback_scale = np.maximum(np.max(np.abs(fallback), axis=0), root_epsilon)
        fallback = fallback / fallback_scale
        centered[:, ~stable] = fallback - fallback.mean(0)
        epsilon_units[~stable] = root_epsilon / fallback_scale
    scale = np.maximum(np.max(np.abs(centered), axis=0), epsilon_units)
    scale[scale == 0] = 1.0
    centered = centered / scale
    denominator = np.hypot(np.sqrt((centered ** 2).mean(0)), epsilon_units / scale)
    return np.divide(centered, denominator, out=np.zeros_like(centered), where=denominator != 0)

def barlow_loss(view_a, view_b, redundancy=0.005, epsilon=1e-05):
    """Return (loss, correlation) for matching finite [N,D] arrays, N>=2.

Standardize columns with sqrt(population_variance+epsilon).
C=Za.T@Zb/N. Loss=sum_i(1-Cii)^2 + redundancy*sum_i!=j Cij^2.
Assume valid shapes, finite positive epsilon and finite nonnegative redundancy.
The supplied helper centers finite reference differences before scaling
deviations, with a scaled-original fallback only for nonfinite centering."""
    raise NotImplementedError('Implement this function, then run the checks.')

def gram_distance(features, anchor):
    """MSE between cosine Gram matrices of [patches,features] arrays.

Nonzero finite rows and matching patch counts assumed. Feature widths may
differ. Normalize each row; compare pairwise patch similarities.
Use floating arithmetic and scale each row before measuring its L2 norm."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Three constant standardized features give C=0.

- Diagonal penalty

<details><summary>Worked answers</summary>

- 3: Three terms (1-0)^2 sum to 3.

</details>

## Experiment

Run `experiments/embodied_ssl.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Train a small encoder on paired noisy views; report feature standard deviations and held-out probe quality.
- Keep a constant-encoder counterexample. Low prediction loss alone is insufficient evidence.

## Transfer Problems

1. Compare the Barlow objective with unregularized pairwise MSE.
2. Calculate normalized patch Gram matrices and test a spatial-token permutation.

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

[Barlow Twins](https://arxiv.org/abs/2103.03230). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [DINOv3](https://arxiv.org/abs/2508.10104)
