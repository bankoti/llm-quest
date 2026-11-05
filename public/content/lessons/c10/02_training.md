# A Training Update That Counts Correctly

Normalize by prediction tokens, accumulate gradients, clip once, and schedule updates.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** optimizer-loop.

## What You Will Be Able to Do

- Compute masked stable cross entropy
- Aggregate unequal microbatches correctly
- Apply clipping and warm-up at optimizer-step boundaries

## The unit of loss is a predicted token

Logits have shape [B,T,V]; integer targets and a Boolean loss mask have shape [B,T]. At each selected position, negative log likelihood is logsumexp(logits) minus the target logit. Convert numeric logits to floating point before subtraction, retaining integer targets and Boolean masks, then subtract the row maximum before exponentiating. Sum selected losses and divide by the number of selected targets. Padding is not an easy prediction to include in the average. An all-masked batch is an input error, not evidence of perfect loss.

To evaluate a dataset, accumulate loss sums and valid-token counts across batches, then divide once. Averaging batch means gives short batches the same weight as long batches. Perplexity is exp(mean NLL) in natural-log units. It is comparable only under a compatible tokenizer, content boundary, and evaluation protocol.

## Accumulation must reproduce a large batch

Suppose two microbatches contain 2 and 6 valid targets. If their mean losses are 3 and 1, the combined mean is (2*3+6*1)/8=1.5, not 2. Scale each microbatch loss sum by the accumulation-window total token count before backward. Then clip the accumulated global gradient norm and take one optimizer step. Clipping each microbatch separately changes the update.

For gradient vector g and threshold c, preserve its direction and bound its global norm, rather than clipping coordinates independently. Measure the norm after dividing by max(abs(g)) so squaring finite large coordinates does not overflow; zero gradients stay zero. Learning-rate schedules advance on optimizer updates, not on every microbatch. Our schedule uses zero-based update index s: warm-up lr=peak*((s+1)/warmup). Form the bounded ratio before multiplying by peak to avoid an overflowing intermediate. After warm-up, cosine-decay from peak to floor across the remaining updates. The final scheduled update reaches the floor when at least two decay points exist.

## Worked Example: Clip the accumulated vector

The accumulated gradient is [3,4], and the norm limit is 2.

1. **Measure:** The L2 norm is sqrt(9+16)=5.
2. **Scale:** Use scale 2/5=0.4, giving [1.2,1.6]. Its direction is unchanged and its norm is 2.
3. **Update:** With SGD learning rate 0.1, subtract [0.12,0.16] from the parameters. Adam adds moment state; clipping still precedes its step.

A correct loss denominator is part of the gradient, not just the logging display.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Token-weighted loss and optimizer-step utilities. NumPy only."""
import numpy as np

def loss_totals(logits, targets, mask):
    """Return (NLL sum, valid count) for [B,T,V] logits and [B,T] targets/mask.

Targets are integer IDs in [0,V); mask is Boolean. Require finite logits,
matching nonempty shapes, and at least one selected target; else ValueError.
Use stable logsumexp. Do not modify inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def clip_gradient(gradient, max_norm):
    """Return a fresh array with global L2 norm at most positive max_norm.

gradient is any finite float array; reject nonpositive/nonfinite max_norm.
Zero gradients stay zero. Preserve direction; do not clip coordinates.
Scale magnitudes before measuring the norm to avoid overflow/underflow."""
    raise NotImplementedError('Implement this function, then run the checks.')

def learning_rate(step, total, warmup, peak, floor=0.0):
    """Zero-based schedule. Integers: 0<=step<total, 0<=warmup<total.

Require 0<=floor<=peak, finite rates. Warm-up: peak*(step+1)/warmup.
Decay: cosine from peak at step=warmup to floor at step=total-1.
If there is only one decay update, use floor for that update."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Batch A: loss sum 12 over 4 tokens. Batch B: loss sum 6 over 6 tokens.

- Combined mean NLL

<details><summary>Worked answers</summary>

- 1.8: (12+6)/(4+6)=1.8. The unweighted average of the two batch means would be 2.

</details>

## Experiment

Run `experiments/scratch_training.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare gradients from one full batch with unequal token-weighted microbatches; report maximum absolute error.
- The experiment trains a tiny causal decoder and reports held-out NLL before and after updates. A short toy run establishes execution, not general language competence.

## Transfer Problems

1. Break accumulation by dividing each microbatch mean equally. Explain when that bug is hidden.
2. Compare clipping thresholds at fixed seed and update count; log unclipped norms too.

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

[LLMs from Scratch: training refinements](https://github.com/rasbt/LLMs-from-scratch/tree/main/appendix-D). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
