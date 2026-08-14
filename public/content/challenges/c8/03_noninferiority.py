def passes_noninferiority(student: dict, reference: dict, margin: float) -> bool:
    """Non-inferiority check, per segment.

    Both dicts map segment name -> metric value (higher is better), e.g.
    {"overall": .82, "tail": .74, "dietary": .91}.

    The student passes only if EVERY segment in `reference` satisfies:

        student[segment] >= reference[segment] - margin

    Notes:
    - The check is per-segment, not on the average: a win on "overall"
      cannot hide a collapse on "tail".
    - margin=0 demands the student match or beat the reference everywhere.
    - Equality counts as passing (>=, not >).
    """
    raise NotImplementedError
