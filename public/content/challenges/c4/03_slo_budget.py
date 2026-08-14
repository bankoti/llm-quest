def critical_path_ms(*, fixed_ms, sequential_ms, parallel_ms, reserve_ms) -> float:
    """End-to-end latency of the critical path.

    Args:
        fixed_ms:      float — unavoidable overhead (network, auth, ...)
        sequential_ms: list of floats — stages that run one after another
                       (all of them are paid)
        parallel_ms:   list of floats — stages that run at the same time
                       (only the SLOWEST one is paid — a fan-out is as
                       slow as its slowest branch)
        reserve_ms:    float — safety margin you refuse to spend

    Return fixed + sum(sequential) + max(parallel) + reserve.
    """
    raise NotImplementedError

def remaining_ms(target_ms, **path) -> float:
    """Slack left in the budget: target_ms minus the critical path.

    `path` takes the same keyword arguments as critical_path_ms.
    Negative means the design already breaks the SLO on paper —
    before any real-world variance is added.
    """
    raise NotImplementedError
