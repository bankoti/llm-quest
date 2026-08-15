"""Speculative decoding: draft cheap, verify exact, bank the speedup."""
import math


def acceptance_prob(p_target: float, q_draft: float) -> float:
    """Probability the target model accepts a drafted token.

    p_target: probability the target model assigns to the drafted token
    q_draft:  probability the draft model assigned to it
    The rejection-sampling rule: accept with probability min(1, p/q).
    Assume q_draft > 0.
    """
    raise NotImplementedError


def simulate_verify(ratios: list, us: list) -> int:
    """Tokens generated in one verify step.

    ratios: p_target/q_draft for each drafted token, in draft order
    us:     uniform random numbers in [0, 1), one per drafted token
    Walk the draft left to right. Token i is accepted if
    us[i] < min(1, ratios[i]). Stop at the first rejection.
    Return accepted_count + 1: on rejection the target's corrected sample
    replaces the bad token; if every draft survives, the target emits one
    bonus token from its own distribution. Either way you get one extra.
    """
    raise NotImplementedError


def expected_tokens(gamma: int, alpha: float) -> float:
    """Expected tokens per verify step for draft length gamma.

    alpha is the per-token acceptance rate (assumed i.i.d.).
    Closed form from Leviathan et al. 2022, Eq. 1:
        E = (1 - alpha^(gamma+1)) / (1 - alpha)
    Handle alpha >= 1.0 by returning float(gamma + 1).
    """
    raise NotImplementedError


def speedup(gamma: int, alpha: float, c: float) -> float:
    """Expected walltime speedup over plain autoregressive decoding.

    c is the draft model's cost per token relative to the target
    (e.g. 0.1 means the draft is 10x cheaper). One verify step costs
    gamma draft tokens plus one target forward pass: (c * gamma + 1)
    target-equivalent units, and yields expected_tokens(gamma, alpha).
    """
    raise NotImplementedError


def best_gamma(alpha: float, c: float, max_gamma: int) -> int:
    """The draft length in [1, max_gamma] that maximizes speedup.

    If several tie, return the smallest.
    """
    raise NotImplementedError
