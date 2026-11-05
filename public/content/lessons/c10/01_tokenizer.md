# A Tokenizer You Can Rebuild

Train byte merges, encode with learned ranks, and decode without losing text.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** subword-tokenization.

## What You Will Be Able to Do

- Implement a byte-BPE lifecycle
- Separate learned merges from special tokens
- Detect a tokenizer/checkpoint mismatch

## Bytes are the reversible starting point

A Unicode character is not necessarily one byte. Encode each training document with UTF-8, producing integers from 0 to 255. The initial vocabulary maps each integer to its one-byte value. All text is representable before learning any merge; no unknown token is required. Decoding concatenates bytes, then decodes UTF-8. A generated incomplete byte sequence may not be valid text, so our decoder raises rather than silently replacing it.

BPE compresses frequent adjacent pairs. Count pairs separately inside each document, select the highest count, and replace non-overlapping occurrences left to right. Our deterministic tie rule chooses the lexicographically smallest pair. The new ID is 256 plus the merge index. Stop when there are no pairs or the requested merge count is reached. Never invent adjacency between two different documents.

## Training frequency is not the inference rule

Encoding new text replays the learned pair merges in their learned order. It does not count new frequencies and retrain. A pair formed by an earlier merge can participate in a later merge. The vocabulary and ordered merges are part of the model contract: logits at index 257 mean whatever this exact tokenizer assigned to 257.

This educational tokenizer has no regex pre-tokenization or special tokens. Production tokenizers often constrain merge boundaries and reserve control tokens. Untrusted text containing a special-token spelling must remain ordinary text unless explicitly admitted as a control token. A round-trip test alone cannot establish checkpoint compatibility; two tokenizers can both round-trip while assigning different IDs.

## Worked Example: Two merges on a tiny corpus

Train on ["abab", "ab"], requesting two merges.

1. **Count within documents:** (97,98) occurs three times; (98,97) once. The end of the first document is not joined to the start of the second.
2. **First merge:** Assign 256 to b"ab". The token lists become [256,256] and [256].
3. **Second merge:** Assign 257 to pair (256,256), meaning b"abab". Encoding "ababab" yields [257,256]. Concatenate their bytes to recover the original text.

Persist vocabulary and merge order with the checkpoint, not just vocabulary size.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Deterministic educational byte BPE. No regex splitting or special tokens."""
from collections import Counter

def _merge(ids, pair, new_id):
    result, i = ([], 0)
    while i < len(ids):
        if i + 1 < len(ids) and (ids[i], ids[i + 1]) == pair:
            result.append(new_id)
            i += 2
        else:
            result.append(ids[i])
            i += 1
    return result

def train_bpe(documents, num_merges):
    """Return (ordered merges, vocabulary).

documents: list[str]; num_merges: nonnegative integer.
merges: list[(left_id, right_id)], new ID = 256 + list index.
vocabulary: dict[int, bytes], including all 256 initial bytes.
Count pairs only within documents; highest count wins, lexicographic tie.
Replace non-overlapping pairs left to right. Stop when no pairs remain.
Raise ValueError for negative/noninteger num_merges. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def encode_bpe(text, merges):
    """Encode a str using the saved ordered merges; never retrain on this text."""
    raise NotImplementedError('Implement this function, then run the checks.')

def decode_bpe(ids, vocabulary):
    """Concatenate vocabulary bytes and decode strict UTF-8 (no replacement)."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

The initial byte vocabulary has 256 entries. Twelve merges are successfully learned.

- Final vocabulary size

<details><summary>Worked answers</summary>

- 268: Each successful merge introduces exactly one ID: 256 + 12.

</details>

## Experiment

Run `experiments/scratch_tokenizer.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare token counts for training-like text and unfamiliar Unicode text. Compression is not model quality.
- Learn the same number of merges on a different corpus and inspect which IDs change. Store the exact artifact before any model training.

## Transfer Problems

1. Add reserved control-token IDs without allowing merges across control boundaries.
2. Write a compatibility check that rejects a same-size vocabulary with swapped IDs.

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

[Karpathy: minbpe](https://github.com/karpathy/minbpe). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
