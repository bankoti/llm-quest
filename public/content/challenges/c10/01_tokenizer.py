# Generated starter; edit the functions in the course editor or notebook.
"""Deterministic educational byte BPE. No regex splitting or special tokens."""
from collections import Counter

def _merge(ids, pair, new_id):
    (result, i) = ([], 0)
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
