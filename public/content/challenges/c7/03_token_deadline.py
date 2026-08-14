def tokens_in_budget(deadline_ms: float, elapsed_ms: float, prefill_ms: float,
                     ms_per_token: float) -> int:
    """How many output tokens still fit before the deadline?

    Time left for decoding = deadline_ms - elapsed_ms - prefill_ms
    (prefill must be paid before the first token appears).

    Return floor(time_left / ms_per_token), but never less than 0 —
    a request that is already over budget fits zero tokens, not minus three.
    """
    raise NotImplementedError

def should_start(deadline_ms, elapsed_ms, prefill_ms, min_useful_tokens,
                 ms_per_token) -> bool:
    """Admission control: only start generating if the answer can be useful.

    A truncated 4-token answer costs full prefill and helps nobody.
    Return True only if the tokens that fit in the remaining budget
    are at least min_useful_tokens. Must return a real bool.
    """
    raise NotImplementedError
