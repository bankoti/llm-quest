"""Debug — Flattering Precision 🐛
An AI assistant wrote your search evaluation. The lazy retriever that returns
one result is mysteriously scoring 100%. ONE conceptual bug.
"""
def precision_at_k(retrieved, relevant, k):
    """Precision@k: how much of the top-k budget was spent on relevant docs.
    retrieved: ranked doc ids; relevant: set of relevant ids."""
    top = retrieved[:k]
    hits = sum(1 for d in top if d in relevant)
    return hits / len(top)
