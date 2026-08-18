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

def fleet_report(incidents: list) -> dict:
    """The postmortem that spans postmortems: where does incident time go?

    incidents: list of dicts, each with the four keyword arguments that
    incident_durations takes (start_minute, detected_minute, ...).

    Return:
        "count":         number of incidents
        "mean_detect":   mean detect duration across incidents
        "mean_mitigate": mean mitigate duration
        "mean_recover":  mean recover duration
        "invest":        the phase name ("detect" | "mitigate" | "recover")
                         with the LARGEST mean duration — where the next
                         engineering hour buys the most total downtime back.

    One slow incident is a story; the mean across incidents is a budget.
    If detection dominates, buy alerting, not faster rollbacks.
    """
    raise NotImplementedError
