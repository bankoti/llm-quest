def can_launch(gates: dict) -> bool:
    """Launch review: every gate must pass. One failure blocks the launch.

    `gates` maps gate name -> bool, with these six keys:
        quality, latency_capacity_cost, fallback_reliability,
        security_privacy, observability_ownership, rollback

    Return True only when ALL gates are True. There is no weighting and
    no compensation: a brilliant quality score cannot buy back a missing
    rollback plan. (This is the "hard gates" rule from Course 4 applied
    to the launch decision.)
    """
    raise NotImplementedError
