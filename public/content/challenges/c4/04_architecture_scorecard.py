from dataclasses import dataclass
from typing import List
@dataclass
class Pattern:
    name:str; latency_p95_ms:float; cost_per_1k_req:float; quality_score:float
    def meets_slo(self,latency_slo_ms:float,cost_slo:float)->bool:
        raise NotImplementedError
def rank_patterns(patterns:List[Pattern],latency_slo_ms:float,cost_slo:float)->List[str]:
    raise NotImplementedError
