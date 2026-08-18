from dataclasses import dataclass
from typing import List, Tuple

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

def uncovered_steps(chain:List[str],controls:List[Tuple[str,str]])->List[str]:
    """The lesson's point that "controls have locations", graded.

    chain:    the causal scenario as an ordered list of step names
              (e.g. untrusted text -> enters context -> ... -> published).
    controls: (control_name, step_it_breaks) pairs. Each control is placed
              at exactly one step of the chain.

    Return the chain steps that no control covers, in chain order.
    Raise ValueError if any control names a step that is not in the chain —
    a control aimed at a step that does not exist is evidence theater.
    """
    raise NotImplementedError

def scenario_mitigated(chain:List[str],controls:List[Tuple[str,str]])->bool:
    """True if at least one step of the chain is covered by a control.

    Breaking ANY link stops this causal path — that is why writing risks as
    scenarios beats generic labels: it turns "be careful" into a location.
    uncovered_steps then tells you how thin the defense is: one covered step
    means one point of failure between you and the incident.
    """
    raise NotImplementedError
