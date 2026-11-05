# Train and Merge Low-Rank Adapters

Make the trainable parameter budget explicit and prove merge equivalence.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-05_instruction, lora.

## What You Will Be Able to Do

- Implement a low-rank residual projection
- Verify frozen base weights
- Train adapters and merge them for evaluation

## A smaller update space

Use the input-row convention: x is [...,d_in], W is [d_in,d_out], A is [d_in,r], and B is [r,d_out]. The adapted layer is xW + (alpha/r)(xA)B. W stays frozen. A and B contain r*(d_in+d_out) trainable scalars instead of d_in*d_out. This constrains the update rank, not necessarily the effective rank of the full layer W+delta_W.

Initialize A randomly and B to zeros. The initial adapted output then matches the base output. On the first step, B can receive a gradient, while A receives zero through B; later both can learn. Initializing both factors to zero traps both gradients at zero. Freezing W means disabling its optimizer updates and gradients, not wrapping the entire forward pass in a no-gradient context.

## Merging is algebra, quality is an experiment

At evaluation with dropout disabled, define merged_W=W+(alpha/r)AB. Then x@merged_W equals the two-branch result up to floating-point error. Test several ranks, rectangular dimensions, and nonzero learned B. Testing only the initial zero adapter cannot detect an implementation that ignores adapters.

The notebook fits a low-rank linear task using real autograd updates, measures held-out error, checks frozen W, and verifies merged predictions. It is deliberately a mechanism experiment, not a claim that rank 2 is sufficient for a useful chat model. Compare rank at a fixed training budget and disclose which layers are adapted. Quantization adds another error source; QLoRA is not reproduced by merely casting W to a smaller dtype.

## Worked Example: Count what the optimizer owns

d_in=512, d_out=512, rank=8.

1. **Full layer:** 512*512=262,144 weight values.
2. **Adapter:** 512*8 + 8*512=8,192 trainable values, 1/32 of the dense layer.
3. **Remember the base:** Frozen base weights still occupy inference/training memory. Adapter parameter reduction is not the same as total memory reduction.

Distinguish trainable state, stored weights, activation memory, and measured task quality.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""LoRA with input-row matrix convention."""
import numpy as np

def lora_forward(x, weight, a, b, alpha):
    """Return x@weight + (alpha/r)*(x@a)@b.

x [...,din], weight [din,dout], a [din,r], b [r,dout], r>=1.
Assume finite float arrays with valid shapes and finite alpha.
Never mutate inputs. No bias/dropout in this browser exercise."""
    raise NotImplementedError('Implement this function, then run the checks.')

def merge_lora(weight, a, b, alpha):
    """Return a fresh weight + (alpha/r)*a@b, same contract as lora_forward."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

d_in=12, d_out=20, rank=3, excluding bias.

- Trainable adapter values

### Worked Answers

- 96: 3*(12+20)=96.

## Experiment

Run `experiments/scratch_adaptation.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The experiment reports actual adapter-loss reduction and merge error, and asserts the base did not change.
- Sweep ranks with the same seed and examples. A larger rank adds capacity, but may not improve held-out performance at the same update count.

## Transfer Problems

1. Derive gradients for A and B by hand on a 2-by-2 example.
2. Add adapter dropout and explain why merge equivalence should be tested in evaluation mode.

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

[LoRA](https://arxiv.org/abs/2106.09685). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
