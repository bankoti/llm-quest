def gate_status(value: float, threshold: float, higher_is_better: bool) -> bool:
    """One gate, from raw evidence: does the measured value meet its threshold?

    higher_is_better=True  -> pass when value >= threshold  (quality, coverage)
    higher_is_better=False -> pass when value <= threshold  (latency, cost, error rate)

    Direction is the whole point: a gate checker that applies >= everywhere
    will happily launch a p95 of 240ms against a 200ms ceiling.
    """
    raise NotImplementedError

def evaluate_gates(evidence: dict) -> dict:
    """Turn a table of raw measurements into gate booleans.

    evidence maps gate name -> (value, threshold, higher_is_better), e.g.
        {"quality": (0.83, 0.80, True), "latency_p95": (240.0, 200.0, False)}

    Return {gate_name: bool} via gate_status. No averaging, no weighting:
    each gate is judged only against its own threshold.
    """
    raise NotImplementedError

def can_launch(gates: dict) -> bool:
    """Launch review: every gate must pass. One failure blocks the launch.

    Return True only when ALL values in `gates` are True. There is no
    weighting and no compensation: a brilliant quality score cannot buy
    back a missing rollback plan. (The "hard gates" rule from Course 4,
    applied to the launch decision.)
    """
    raise NotImplementedError

def blocking_gates(gates: dict) -> list:
    """Names of the failed gates, sorted alphabetically.

    This list IS the launch review outcome: "no" is not actionable,
    "no, because latency_p95 and rollback" is.
    """
    raise NotImplementedError
