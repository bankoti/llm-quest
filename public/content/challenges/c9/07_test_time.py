"""Test-time compute: buy accuracy with inference FLOPs instead of parameters."""
import math


def best_of_n(p: float, n: int) -> float:
    """Probability that at least one of n independent samples is correct.

    p is the single-sample accuracy. Assumes a perfect verifier that can
    always recognize a correct answer when one appears (the pass@n ceiling).
    """
    raise NotImplementedError


def majority_vote(p: float, n: int) -> float:
    """Accuracy of majority voting over n independent samples (n odd).

    Each sample is independently correct with probability p, and wrong
    answers never collide (any correct majority wins). The answer is the
    probability that more than half the samples are correct:
        sum over k in [n//2 + 1, n] of C(n, k) * p^k * (1-p)^(n-k)
    Use math.comb.
    """
    raise NotImplementedError


def samples_needed(p: float, target: float) -> int:
    """Minimum n such that best_of_n(p, n) >= target.

    If a single sample already meets the target, return 1.
    Otherwise solve (1-p)^n <= 1 - target for the smallest integer n
    (use logs + math.ceil; assume 0 < p < 1 and p < target < 1).
    """
    raise NotImplementedError


def cheaper_strategy(p_small: float,
                     params_small: int,
                     params_large: int,
                     target: float) -> str:
    """'small' or 'large': the cheaper way to hit target accuracy.

    Option A: one sample from a large model that meets the target.
    Option B: best-of-n sampling from a small model with single-sample
    accuracy p_small.
    Inference cost per token is ~2 * params FLOPs. Compare
    samples_needed * 2 * params_small against 2 * params_large.
    Return 'small' if strictly cheaper, else 'large'.
    """
    raise NotImplementedError
