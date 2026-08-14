def choose_pattern(head_coverage: float, latency_ms: int, unlabeled_pairs: int) -> str:
    """Choose where AI should run for a search stack. Return one of:
    "head-cache" | "live-model" | "teacher-student"

    Decision rules (apply in order — see lesson "Choose Where AI Runs"):

    1. head_coverage >= 0.5 -> "head-cache"
       Traffic is skewed: half or more of requests hit precomputable head
       queries. Cache validated answers; only misses need a model.

    2. else, latency_ms >= 150 -> "live-model"
       Coverage is low but the deadline is loose enough for a live model
       call with schema validation and a hard timeout.

    3. else -> "teacher-student"
       Low coverage AND a tight deadline: no live call fits. Distill —
       a teacher labels the unlabeled_pairs offline, a small student
       serves online within the deadline.

    Args:
        head_coverage:  fraction of traffic answerable from the head cache (0..1)
        latency_ms:     end-to-end deadline for this component
        unlabeled_pairs: logged (query, item) pairs available for distillation
    """
    raise NotImplementedError
