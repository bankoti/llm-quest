from dataclasses import dataclass
from typing import List,Set
@dataclass(frozen=True)
class FailureEvidence:
    scenario:str; observed:bool; bounded:bool; security_preserved:bool; telemetry_present:bool; recovered:bool
def campaign_complete(required:Set[str],rows:List[FailureEvidence])->bool:
    raise NotImplementedError
