from typing import List

def expected_calibration_error(confidences: List[float], outcomes: List[int],
                               bins: int = 10) -> float:
    """Expected Calibration Error (ECE).

    Split [0, 1] into `bins` equal-width confidence bins. A confidence of
    exactly 1.0 belongs to the last bin. For each non-empty bin compute:

        gap = | mean(confidence in bin) - mean(outcome in bin) |

    i.e. "the model said 80%, it was right 55% of the time -> gap 0.25".

    Return the weighted average of the gaps, weighting each bin by the
    fraction of samples it holds:

        ECE = sum over bins of (n_bin / n_total) * gap_bin

    A perfectly calibrated model scores 0. A model that says 0.9 on
    examples it always gets wrong scores 0.9.
    """
    raise NotImplementedError
