"""Level 69 — GRPO Advantages

Implement Group Relative Policy Optimization advantage computation.
"""
from typing import List

def grpo_advantages(rewards: List[float]) -> List[float]:
    """
    Normalize a group of rewards to advantages.
    advantage_i = (reward_i - mean) / std

    std is the population standard deviation (divide by N, not N-1).
    If std == 0 (all rewards equal), return all zeros.
    """
    raise NotImplementedError

def kl_penalty(log_pi: float, log_pi_ref: float) -> float:
    """
    Approximate KL divergence penalty for one token:
    KL(pi || pi_ref) ~= exp(log_pi_ref - log_pi) - (log_pi_ref - log_pi) - 1
    This is the reverse-KL approximation used in PPO/GRPO.
    """
    raise NotImplementedError

def grpo_loss(log_probs: List[float], advantages: List[float],
              log_probs_ref: List[float], kl_coeff: float) -> float:
    """
    Introductory policy-gradient surrogate for one response.
    loss = -mean(advantage_i * log_prob_i) + kl_coeff * mean(kl_penalty_i)

    This is component practice, NOT the full clipped GRPO objective. It
    omits the old-policy importance ratio, clipping, rollout collection,
    and parameter updates. The full algorithm is taught in the RL track.
    """
    raise NotImplementedError
