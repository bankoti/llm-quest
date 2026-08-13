from dataclasses import dataclass
@dataclass(frozen=True)
class Metrics:
    quality:float; error_rate:float; p95_ms:float
def can_promote(baseline:Metrics,canary:Metrics,*,minimum_quality_delta:float,maximum_error_increase:float,maximum_p95_increase_ms:float)->bool:
    raise NotImplementedError
