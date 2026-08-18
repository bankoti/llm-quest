from dataclasses import dataclass
from typing import List,Set

@dataclass(frozen=True)
class FailureEvidence:
    scenario:str; observed:bool; bounded:bool; security_preserved:bool; telemetry_present:bool; recovered:bool

def proven(row:FailureEvidence)->bool:
    """A scenario is proven only when ALL five evidence fields are True:
    the failure was observed under injection, the response stayed bounded,
    no security invariant was bypassed, telemetry captured it, and the
    system recovered. Four out of five is an open finding, not evidence.
    """
    raise NotImplementedError

def unproven(required:Set[str],rows:List[FailureEvidence])->List[str]:
    """Required scenarios that are NOT yet proven, sorted alphabetically.

    A scenario is unproven if it has no row at all, or if none of its rows
    passes proven(). Extra rows for non-required scenarios are fine and
    ignored. This list is the campaign's remaining work — each entry
    becomes a blocker or an explicitly accepted residual risk.
    """
    raise NotImplementedError

def campaign_complete(required:Set[str],rows:List[FailureEvidence])->bool:
    """True when every required scenario is proven — i.e. unproven() is empty."""
    raise NotImplementedError
