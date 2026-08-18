"""Level 68 — DPO Loss

Implement the Direct Preference Optimization loss.
"""
import math

def log_sigmoid(x: float) -> float:
    """Numerically stable log(sigmoid(x)) = -log(1 + exp(-x))."""
    raise NotImplementedError

def dpo_loss(log_pi_chosen: float, log_pi_rejected: float,
             log_pi_ref_chosen: float, log_pi_ref_rejected: float,
             beta: float) -> float:
    """
    DPO loss for one (prompt, chosen, rejected) triple.
    
    loss = -log_sigmoid(
        beta * (log_pi_chosen - log_pi_ref_chosen)
      - beta * (log_pi_rejected - log_pi_ref_rejected)
    )
    
    All log-probs are sum of token log-probs for the response.
    """
    raise NotImplementedError

def dpo_implicit_reward(log_pi: float, log_pi_ref: float,
                         beta: float) -> float:
    """Implicit reward r(x,y) = beta * (log pi(y|x) - log pi_ref(y|x))."""
    raise NotImplementedError
