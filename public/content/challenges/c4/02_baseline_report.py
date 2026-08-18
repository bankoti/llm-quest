def precision_at_k(results,relevant,k)->float:
    """Fraction of the top-k retrieved items that are relevant.

    precision@k = |relevant ∩ results[:k]| / k

    Args:
        results:  ordered list of retrieved item ids (best first)
        relevant: collection of known-relevant item ids
        k:        budget; denominator is always k even if fewer items retrieved
    Returns float in [0, 1].
    """
    raise NotImplementedError
def mean_precision(queries,k)->float:
    """Mean P@k across a set of queries.

    Args:
        queries: list of (results, relevant) tuples
        k:       budget passed to precision_at_k for every query
    Returns the arithmetic mean of per-query P@k values.
    """
    raise NotImplementedError
def baseline_report(queries,k)->dict:
    """Aggregate evaluation report over a query set.

    Returns a dict with at least:
        'queries'             — int, number of queries evaluated
        'k'                   — int, the k value used
        'mean_precision_at_k' — float, mean P@k across all queries
    """
    raise NotImplementedError
