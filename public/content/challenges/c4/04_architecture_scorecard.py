from dataclasses import dataclass
from typing import List
@dataclass
class Pattern:
    name:str; latency_p95_ms:float; cost_per_1k_req:float; quality_score:float
    def meets_slo(self,latency_slo_ms:float,cost_slo:float)->bool:
        """True if BOTH hard gates pass:
            latency_p95_ms  <= latency_slo_ms   (deadline not exceeded)
            cost_per_1k_req <= cost_slo         (cost within budget)
        A pattern that fails either gate is excluded before quality scoring.
        """
        raise NotImplementedError
def rank_patterns(patterns:List[Pattern],latency_slo_ms:float,cost_slo:float)->List[str]:
    """Return names of qualifying patterns sorted by quality_score descending.

    Filter step: exclude any pattern where meets_slo(...) is False.
    Sort step:   sort survivors by quality_score, highest first.
    Returns list of name strings (empty if none qualify).
    """
    raise NotImplementedError
