import math
from typing import Sequence

def dcg(ranked:Sequence[str],relevant:Sequence[str],k:int)->float:
    """Discounted cumulative gain at k, binary gains.

    DCG@k = sum over positions i = 1..k of  (2^rel_i - 1) / log2(i + 1)
    where rel_i is 1 if ranked[i-1] is in relevant, else 0.

    Positions beyond len(ranked) contribute nothing. Each position scores
    independently: a duplicated id earns its gain again.
    """
    raise NotImplementedError

def ndcg(ranked:Sequence[str],relevant:Sequence[str],k:int)->float:
    """DCG@k normalized by the ideal DCG@k (every relevant doc ranked first).

    NDCG@k = DCG@k / IDCG@k

    Return 0.0 when IDCG is 0. That covers both k=0 and no-relevant-docs,
    the two cases where libraries silently disagree if left undefined.
    """
    raise NotImplementedError
