# Turn a Decoder into a Classifier

Pool the last real token, train a task head, and evaluate beyond accuracy.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-03_checkpoint.

## What You Will Be Able to Do

- Pool by attention-mask position
- Train a classification head on frozen features
- Interpret confusion matrices and macro F1

## The last token is a representation, not a label

A decoder produces hidden states H of shape [B,T,D]. For sequence classification, select the state at the largest index whose attention mask is true. This accommodates both left and right padding. The count of true entries minus one only works for right padding with no gaps. Reject empty sequences. A linear head maps the selected D-vector to C class logits, trained with class cross entropy.

First freeze the backbone and train only the head. This separates whether the representation contains useful information from the cost and instability of updating every weight. Then optionally unfreeze a top block or use adapters. The actual CPU experiment compares a majority-class baseline with a trained head on a held-out split of a tiny synthetic sequence task. It does not claim a useful spam classifier from toy pretraining.

## Accuracy can reward ignoring a class

For a binary task, count TP, FP, FN, and TN on held-out examples. Positive-class F1 is 2TP/(2TP+FP+FN). Compute the analogous value for the negative class and average to obtain macro F1. Define a zero denominator to produce 0 in this exercise. Report per-class support; a macro number without support can be misleading on tiny samples.

Split by the real unit of independence before fitting: related messages, customers, or duplicated documents should not leak across partitions. Select thresholds using validation data only. The final test split remains untouched until the choice is fixed. The browser lab implements pooling and binary metrics; the notebook supplies the differentiable training loop and measured learning curves.

## Worked Example: An accurate model that misses all positives

There are 90 negative and 10 positive test examples. Predict negative for everyone.

1. **Accuracy:** 90/100=0.9, apparently strong until compared with the majority baseline.
2. **Positive class:** TP=0, FP=0, FN=10, so positive F1=0.
3. **Negative class:** Negative-class F1=180/(180+10)=18/19. Macro F1 is 9/19, about 0.474.

A useful task evaluation exposes the failure that its users care about.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Pooling and binary classification metrics."""
import numpy as np

def last_valid(hidden, attention_mask):
    """Gather [B,D] from finite hidden [B,T,D] at the LAST true mask position.

attention_mask is Boolean [B,T]; left/right padding and gaps are allowed.
Reject mismatched shapes or rows with no valid positions with ValueError.
Return a fresh array; never mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def binary_metrics(labels, predictions):
    """Return accuracy, macro_f1, tp, fp, fn, tn for nonempty 1D binary IDs.

Classwise F1=2TP/(2TP+FP+FN); a zero denominator gives 0.
Macro F1 includes both classes even if one has zero support.
Invalid shapes, empty input, or values outside {0,1}: ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A row mask is [0,0,1,1,1]. Positions are zero-based.

- Index to pool

### Worked Answers

- 4: The last true position is 4, not mask.sum()-1=2.

## Experiment

Run `experiments/scratch_adaptation.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Report baseline accuracy, trained-head accuracy, and macro F1 on held-out labels, with a fixed seed and sample counts.
- Freezing features still permits the head gradient. Check that backbone tensors remain bitwise unchanged.

## Transfer Problems

1. Evaluate left-padded and right-padded copies of the same examples.
2. Create an imbalanced split and explain accuracy and macro F1 together.

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

[LLMs from Scratch: classification adaptation](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch06). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
