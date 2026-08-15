"""Collections: the list and dict idioms that keep course code short."""


def top_k(scores: list, k: int) -> list:
    """Indices of the k largest scores, best first.

    top_k([0.3, 0.9, 0.5], 2) == [1, 2]. This is the heart of reranking
    and retrieval. Sort the index range by score, descending, slice k:
        sorted(range(len(scores)), key=..., reverse=True)[:k]
    """
    raise NotImplementedError


def argmax(xs: list) -> int:
    """Index of the largest value; on ties, the first occurrence.

    argmax([2, 7, 7]) == 1. A plain loop with a strict > comparison keeps
    the first maximum. max(range(len(xs)), key=xs.__getitem__) also works.
    """
    raise NotImplementedError


def count_labels(labels: list) -> dict:
    """Count occurrences: ['a','b','a'] -> {'a': 2, 'b': 1}.

    A dict and .get(label, 0) + 1 is the idiom.
    """
    raise NotImplementedError


def pair_deltas(before: list, after: list) -> list:
    """Elementwise after - before for two equal-length lists.

    zip walks two lists in lockstep; a list comprehension collects results:
        [a - b for b, a in zip(before, after)]
    """
    raise NotImplementedError
