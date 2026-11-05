"""Deterministic educational byte BPE. No regex splitting or special tokens."""
from collections import Counter


def _merge(ids, pair, new_id):
    result, i = [], 0
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
    Raise ValueError for negative/noninteger num_merges. Do not mutate inputs.
    """
    if not isinstance(num_merges, int) or isinstance(num_merges, bool) or num_merges < 0:
        raise ValueError('num_merges must be a nonnegative integer')
    sequences = [list(text.encode('utf-8')) for text in documents]
    vocab = {i: bytes([i]) for i in range(256)}
    merges = []
    for _ in range(num_merges):
        counts = Counter(pair for ids in sequences for pair in zip(ids, ids[1:]))
        if not counts:
            break
        pair = min(counts, key=lambda p: (-counts[p], p))
        new_id = 256 + len(merges)
        vocab[new_id] = vocab[pair[0]] + vocab[pair[1]]
        merges.append(pair)
        sequences = [_merge(ids, pair, new_id) for ids in sequences]
    return merges, vocab


def encode_bpe(text, merges):
    """Encode a str using the saved ordered merges; never retrain on this text."""
    ids = list(text.encode('utf-8'))
    for rank, pair in enumerate(merges):
        ids = _merge(ids, tuple(pair), 256 + rank)
    return ids


def decode_bpe(ids, vocabulary):
    """Concatenate vocabulary bytes and decode strict UTF-8 (no replacement)."""
    return b''.join(vocabulary[i] for i in ids).decode('utf-8')
