def precision_at_k(results,relevant,k)->float:
    """Fraction of the top-k retrieved items that are relevant.

    precision@k = |relevant ∩ results[:k]| / k

    The denominator is always k, even if fewer than k items were retrieved:
    the metric charges you for the whole budget you were given.
    Returns float in [0, 1].
    """
    raise NotImplementedError

def mean_precision(queries,k)->float:
    """Mean P@k across queries.

    queries: list of (results, relevant) tuples.
    Returns the arithmetic mean of per-query P@k values.
    """
    raise NotImplementedError

def baseline_report(queries,k)->dict:
    """Slice-aware evaluation report — the graded version of the lesson's
    core claim: an aggregate score can hide a completely dead slice.

    queries: list of (results, relevant, slice_name) triples, where
             slice_name tags the traffic slice ("head", "torso", "tail", ...).

    Returns a dict with:
        "queries"             — int, total number of queries
        "k"                   — int, the k used
        "mean_precision_at_k" — float, mean P@k over ALL queries
        "slices"              — dict slice_name -> mean P@k within that slice
        "worst_slice"         — the slice name with the lowest mean P@k

    The report must make a zero-scoring slice impossible to miss even when
    the aggregate looks healthy.
    """
    raise NotImplementedError
