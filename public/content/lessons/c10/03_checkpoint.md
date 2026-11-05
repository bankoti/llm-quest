# Resume the Run, Not Just the Weights

Recover optimizer and random state, and import external tensors without silent transposes.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-02_training.

## What You Will Be Able to Do

- Resume deterministic CPU updates
- Validate tokenizer and model metadata
- Map a foreign weight fixture explicitly

## Inference state is not training state

Weights alone are sufficient for a deterministic forward pass given the architecture, preprocessing, and mode. Continuing training also depends on optimizer moments, step number, schedule, random-number generators, and data position. A shuffled sampler and dropout consume randomness. Mixed-precision runs can additionally require a gradient-scaler state. The experiment restores a CPU Torch generator and Adam state; distributed determinism is a separate challenge.

A useful checkpoint records model config, tokenizer fingerprint, model tensors, optimizer state, completed updates, RNG state, and data cursor. Validate identity before applying arrays. Never load untrusted pickle-based files with unrestricted deserialization. Our browser lab uses ordinary arrays and dictionaries; it is about compatibility checks, not a secure serialization format.

## External weights need a declared mapping

A linear map may be stored as [out,in] in one library and [in,out] in another. Similar parameter names are not proof of equal meaning. Explicitly map source names to destination names, specify transpose operations, validate shapes and finite values, and reject missing or unexpected tensors. Square matrices can hide orientation mistakes, so tests must use rectangular fixtures and numerical forward equivalence.

Our import_weights function accepts a source dictionary, a destination specification of shapes, and a mapping destination -> (source_name, transpose). It returns independent arrays. Every source key and every destination key must appear exactly once. This deliberately small contract excludes split/fused QKV, tensor parallel shards, and quantized formats. Real GPT-2 downloads remain optional: the mechanism is learnable without network access or model-license assumptions.

## Worked Example: A rectangular projection

A source stores W=[[1,2],[3,4],[5,6]] with shape [3,2]. The destination expects [2,3].

1. **Declare orientation:** The map explicitly requests transpose. Destination W becomes [[1,3,5],[2,4,6]].
2. **Check computation:** For x=[10,20], x @ destination_W equals [50,110,170], the same as source_W @ x.
3. **Test continuation:** Save after step k, run step k+1, restore into fresh objects, repeat the same sampled batch, and compare parameters and loss. A fresh Adam optimizer should fail this equivalence.

A load that succeeds syntactically can still mean a different model or a different training run.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Explicit local weight-import contract; no deserialization of external files."""
import numpy as np

def import_weights(source, shapes, mapping):
    """Return copied destination arrays from an explicit tensor mapping.

source: {name: finite ndarray}; shapes: {destination: expected shape tuple}.
mapping: {destination: (source_name, transpose_bool)}. A transpose requires
a 2D array. Every source and destination must occur exactly once.
Reject missing/extra keys, repeated sources, invalid flags, nonfinite values,
or wrong shapes with ValueError. Do not mutate/alias source arrays."""
    raise NotImplementedError('Implement this function, then run the checks.')

def validate_checkpoint(checkpoint, config, tokenizer_id):
    """Validate a metadata envelope and return completed update count.

Require keys model, optimizer, rng, cursor, step, config, tokenizer_id.
config and tokenizer_id must exactly equal expected values. step/cursor
are nonnegative integers (not bool). Missing keys/mismatch: ValueError.
This checks metadata only, not tensor integrity or deserialization safety."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A dense projection expects [input=4, output=7].

- Number of weight values (no bias)

<details><summary>Worked answers</summary>

- 28: 4*7=28. A matching count alone does not prove matching orientation.

</details>

## Experiment

Run `experiments/scratch_training.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The training experiment performs one uninterrupted and one restored continuation and asserts matching CPU losses and tensors.
- Change only the saved optimizer state and observe the discrepancy. Exact reproducibility across devices and library releases is not promised.

## Transfer Problems

1. Add a data-order fingerprint and reject a resume against a different corpus.
2. Extend the mapping to a fused QKV fixture with explicit split offsets and independent forward checks.

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

[PyTorch: general checkpoints](https://pytorch.org/tutorials/recipes/recipes/saving_and_loading_a_general_checkpoint.html). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
