def incident_durations(*, start_minute: float, detected_minute: float,
                       mitigated_minute: float, recovered_minute: float) -> dict:
    """Compute incident phase durations from a timeline of minute marks.

    Timeline order must be: start <= detected <= mitigated <= recovered.
    If any timestamp is out of order, raise ValueError — a report built
    on an impossible timeline is worse than no report.

    Return a dict with exactly these keys:
        "detect":   detected - start        (time to notice)
        "mitigate": mitigated - detected    (time to stop the bleeding)
        "recover":  recovered - mitigated   (time back to normal)
        "total":    recovered - start
    """
    raise NotImplementedError
