from dataclasses import dataclass

@dataclass(frozen=True)
class Metrics:
    quality:float; error_rate:float; p95_ms:float

# Traffic percentages a rollout walks through, in order.
RAMP_STAGES=(1,5,25,50,100)

def can_promote(baseline:Metrics,canary:Metrics,*,minimum_quality_delta:float,maximum_error_increase:float,maximum_p95_increase_ms:float)->bool:
    """True only if quality improves by at least minimum_quality_delta AND
    neither guardrail is breached (error_rate up by more than
    maximum_error_increase, or p95_ms up by more than maximum_p95_increase_ms).
    A quality win can never buy back a guardrail breach."""
    raise NotImplementedError

def decide(baseline:Metrics,canary:Metrics,*,minimum_quality_delta:float,maximum_error_increase:float,maximum_p95_increase_ms:float,min_samples:int,samples:int)->str:
    """Return 'promote', 'hold', or 'rollback'.
    Decision rule (in this order):
    1. Any guardrail breach -> 'rollback', even on thin evidence. Demonstrated
       harm is not something you wait out.
    2. samples < min_samples -> 'hold'. You may not promote on evidence you
       would not accept in a review.
    3. Quality delta meets minimum_quality_delta -> 'promote'.
    4. Otherwise -> 'hold': no harm shown, but no proven win either."""
    raise NotImplementedError

def next_ramp(current_pct:int,decision:str)->int:
    """Next traffic percentage given the decision.
    'rollback' -> 0. 'hold' -> stay at current_pct.
    'promote' -> the next stage in RAMP_STAGES above current_pct (100 stays 100)."""
    raise NotImplementedError
