from typing import List
def position_bias_score(ab_results:List[str],ba_results:List[str])->float:
    """Fraction of trials where the winner changes when positions are swapped.

    ab_results[i]: judge verdict when system A was presented first ('A','B', or 'tie')
    ba_results[i]: judge verdict when system B was presented first (same options)

    A trial is *inconsistent* (position-biased) when ab_results[i] != ba_results[i].
    Returns inconsistent_count / total_trials.
    0.0 = no position bias; 1.0 = winner is always the first-presented system.
    """
    raise NotImplementedError
def verbosity_correlation(scores:List[float],lengths:List[int])->float:
    """Pearson correlation between judge scores and response lengths.

    A strong positive correlation (close to 1.0) means the judge
    systematically rewards longer responses regardless of quality.
    Use scipy.stats.pearsonr or implement from first principles:
        r = cov(scores, lengths) / (std(scores) * std(lengths))
    Returns float in [-1, 1].
    """
    raise NotImplementedError
