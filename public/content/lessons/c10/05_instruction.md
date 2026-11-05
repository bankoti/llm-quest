# Instruction Data and the Three Masks

Build shifted targets that score responses and EOS without learning from padding.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-04_classification.

## What You Will Be Able to Do

- Collate variable-length prompt-response examples
- Distinguish causal, padding, and loss masks
- Run response-only supervised updates

## Prompt tokens are context even when they are not targets

For each example concatenate prompt IDs, response IDs, and one EOS ID. Construct input=sequence[:-1] and target=sequence[1:]. At input position i, the target is original token i+1. Score it when i+1 is at least the prompt length, so the final prompt state learns to predict the first response token. Include EOS in the response loss; otherwise the model receives no direct lesson about stopping.

Our collate_sft accepts nonempty prompt lists, response lists (possibly empty), eos, pad, and max_length. Each example must fit completely; raise rather than silently truncating away its response. Pad inputs and targets to the largest shifted length in the batch, return input attention masks and response loss masks, and leave padding unscored. An empty response still has an EOS target.

## Three masks answer three different questions

The causal mask prevents attention to future positions. The attention/padding mask prevents attending to absent input tokens. The loss mask selects which target errors contribute gradients. Zeroing prompt loss does not remove prompt tokens from attention: the answer should depend on the instruction. Packed multi-example training additionally needs document-boundary attention isolation; this lab uses one example per row instead.

Teacher forcing exposes the gold prefix during training, whereas generation consumes the model's own predictions. Evaluate both held-out response NLL and free-running exact-match or task checks. Keep near-duplicate prompts and answers from crossing splits. A decrease in training loss alone neither proves instruction following nor excludes memorization.

## Worked Example: Shift before deciding what to score

Prompt=[10,11], response=[20,21], EOS=2.

1. **Concatenate:** Sequence=[10,11,20,21,2].
2. **Shift:** Inputs=[10,11,20,21], targets=[11,20,21,2].
3. **Mask loss:** Loss mask=[0,1,1,1]. Position 1 predicts the first response token 20. All four input positions are real.

An off-by-one mask can remove the first response target or train on the prompt by accident.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Response-only SFT collation. Lists are token IDs, not raw text."""
import numpy as np

def collate_sft(examples, eos, pad, max_length):
    """Return dict input_ids, targets, attention_mask, loss_mask as [B,T] arrays.

examples is a nonempty list of (nonempty prompt IDs, response IDs).
Append one EOS, shift input/target by one, and score response plus EOS.
Pad to largest shifted length. Input IDs/targets use pad at padded positions.
Boolean masks; integer IDs. max_length bounds the SHIFTED length.
Reject oversized/empty-prompt/negative-ID examples with ValueError.
Inputs must not be mutated. Empty responses still score EOS."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A prompt has 5 tokens and its response has 3 tokens, followed by EOS.

- Number of scored targets

### Worked Answers

- 4: Three response tokens plus EOS. Prompt length affects context, not this count.

## Experiment

Run `experiments/scratch_adaptation.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The experiment learns a tiny instruction-conditioned mapping with held-out prompt variants; log response-only loss and exact-match separately.
- Switch to a prompt-only loss mask as a negative control. Low loss on repeated prompt boilerplate is not successful answer training.

## Transfer Problems

1. Specify a safe truncation policy that preserves at least one response target and the role boundary.
2. Add separate role tokens without permitting user text to create a new trusted role.

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

[LLMs from Scratch: instruction adaptation](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
