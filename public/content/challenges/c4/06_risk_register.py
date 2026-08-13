from dataclasses import dataclass
from typing import List
@dataclass(frozen=True)
class Risk:
    name:str; likelihood:int; impact:int; exposure:int; control_strength:float
def residual_score(risk:Risk)->float:
    raise NotImplementedError
def prioritize(risks:List[Risk])->List[str]:
    raise NotImplementedError
