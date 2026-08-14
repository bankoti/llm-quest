from typing import Sequence

def fuse(rankings: Sequence[Sequence[str]], k: int = 60) -> dict:
    """Reciprocal Rank Fusion (RRF) over several ranked lists.

    Each inner sequence is one system's ranking, best first (BM25's list,
    the dense retriever's list, ...). For every unique doc id, sum over
    the lists that contain it:

        score += 1 / (k + rank)      # rank is 1-based position

    Rules:
    - rank 1 is the top of a list, so a first place is worth 1/(k+1).
    - If a doc appears more than once within the SAME list, count only
      its best (first) position — duplicates must not double-dip.
    - Docs missing from a list simply contribute nothing for that list.

    Return {doc_id: fused_score}. No score normalization is needed —
    that insensitivity to score scales is exactly why RRF is used.
    """
    raise NotImplementedError
