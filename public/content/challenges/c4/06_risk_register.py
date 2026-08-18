from dataclasses import dataclass
from typing import List
@dataclass(frozen=True)
class Risk:
    name:str; likelihood:int; impact:int; exposure:int; control_strength:float
def residual_score(risk:Risk)->float:
    """Risk score after controls are applied.

    raw_score = likelihood * impact * exposure
    residual  = raw_score * (1 - control_strength)

    control_strength=0.0 → no mitigation; 1.0 → fully eliminated (score=0).
    """
    raise NotImplementedError
def prioritize(risks:List[Risk])->List[str]:
    """Return risk names sorted by residual_score descending (highest risk first)."""
    raise NotImplementedError
