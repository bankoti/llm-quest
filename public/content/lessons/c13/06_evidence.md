# Compare Architectures Without a Winner Narrative

Audit encoder swaps, latent-text prediction, robot planning, and the evidence needed for deployment.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** embodied-05_planning.

## What You Will Be Able to Do

- Design matched representation comparisons
- Distinguish V-JEPA, VL-JEPA, and LeWorldModel
- Report paired outcome uncertainty and limits

## Different objectives, different interfaces

CLIP aligns images and text using paired contrastive training. V-JEPA predicts video features; V-JEPA 2 additionally studies action-conditioned post-training for planning. Swapping one encoder for another while retaining a downstream controller tests a particular representation/interface combination. It is not proof that one training objective universally dominates. Keep data, readout capacity, fine-tuning access, control budget, and evaluation tasks visible.

VL-JEPA predicts continuous target-text embeddings from visual-language context and can invoke a text decoder when needed. It therefore should not be summarized as a system that can never produce text. LeWorldModel trains pixel-derived embeddings and action-conditioned prediction jointly with an explicit anti-collapse regularizer. These systems differ in what is predicted, how representations are learned, and how actions or text are produced.

## An evidence ledger for a research claim

Record the actual task, training data, observation inputs, action space, model/encoder, frozen versus trained components, optimization budget, planning budget, seeds, success definition, and known failures. PushT requires object contact and orientation; a low latent distance is not automatically task completion. Report the task metric separately from representation loss.

The lab computes paired success differences for two methods on the same trial IDs and a bootstrap interval using a fixed seed. Paired resampling keeps each trial's two outcomes together. This estimates uncertainty under the sampled trials, not robustness to unseen deployment domains. Hierarchical or long-horizon claims additionally need subgoal feasibility, cumulative failure, latency, recovery, and human-intervention evidence. The final defense must state what the experiments cannot establish.

## Worked Example: Pair the trials

A succeeds on [1,0,1,0], B on [1,1,1,0] for the same four trials.

1. **Differences:** B-A=[0,1,0,0].
2. **Mean:** The observed success-rate difference is .25.
3. **Uncertainty:** Resample trial indices, applying each sampled index to both methods. Four trials provide weak evidence; a point estimate alone is not a deployment case.

A fair comparison matches the question, resources, trials, and uncertainty, not just model names.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Paired bootstrap over explicitly synthetic binary outcomes."""
import numpy as np

def paired_success(a, b, seed=0, resamples=2000):
    """Return dict difference, lower, upper for paired B-minus-A outcomes.

Nonempty matching 1D binary arrays. Integer resamples>=100; invalid:
ValueError. Percentile interval at 2.5/97.5 using default_rng(seed).
Resample N paired indices with replacement per draw. This is not a
distribution-shift or physical-safety guarantee."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Method A succeeds in 6 of 10 paired trials; B in 8 of 10.

- Observed B-minus-A rate difference

### Worked Answers

- 0.2: .8-.6=.2. The pairing affects uncertainty, not this mean difference.

## Experiment

Run `experiments/embodied_evidence.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The coding example uses explicitly synthetic outcomes and must not be cited as paper benchmark data.
- Write a comparison table for CLIP, V-JEPA 2, VL-JEPA, and LeWorldModel from primary sources, separating architecture facts from reported results.

## Transfer Problems

1. Explain why trials grouped by scene or robot may require cluster resampling instead of independent trial resampling.
2. Draft a deployment rejection criterion for long-horizon failures despite a good average score.

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

[VL-JEPA](https://arxiv.org/abs/2512.10942). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [CLIP](https://arxiv.org/abs/2103.00020)
- [V-JEPA 2](https://arxiv.org/abs/2506.09985)
- [LeWorldModel](https://arxiv.org/abs/2603.19312)
