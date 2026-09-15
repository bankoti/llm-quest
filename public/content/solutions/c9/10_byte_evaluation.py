import numpy as np
from numbers import Integral

def _positive_integer(value):
    return isinstance(value, Integral) and not isinstance(value, (bool, np.bool_)) and value > 0

def bits_per_byte(nll_nats, content_bytes):
    losses = np.asarray(nll_nats, dtype=float)
    if (losses.ndim != 1 or not losses.size or not np.isfinite(losses).all()
            or (losses < 0).any() or not _positive_integer(content_bytes)):
        raise ValueError('expected NLL values and a positive content-byte count')
    return float(losses.sum() / (content_bytes * np.log(2)))

def logit_storage(positions, vocab_size, top_k=None):
    if not _positive_integer(positions) or not _positive_integer(vocab_size):
        raise ValueError('positive integer dimensions required')
    if top_k is None:
        return int(positions * vocab_size * 4)
    if not _positive_integer(top_k) or top_k > vocab_size:
        raise ValueError('top_k must be an integer within vocabulary size')
    return int(positions * top_k * 8)

def serving_summary(content_bytes, elapsed_ms):
    counts, times = np.asarray(content_bytes), np.asarray(elapsed_ms, dtype=float)
    if (counts.ndim != 1 or times.shape != counts.shape or not counts.size
            or counts.dtype.kind not in 'iu' or (counts <= 0).any()
            or not np.isfinite(times).all() or (times <= 0).any()):
        raise ValueError('expected positive byte counts and completed request times')
    return {'bytes_per_second': float(1000 * counts.sum() / times.sum()),
            'p95_ms': float(np.sort(times)[int(np.ceil(.95 * len(times))) - 1])}

def evidence_region(measured_flops, target_flops):
    values = np.asarray(measured_flops, dtype=float)
    if (values.ndim != 1 or not values.size or not np.isfinite(values).all()
            or (values <= 0).any() or not np.isscalar(target_flops)
            or not np.isfinite(target_flops) or target_flops <= 0):
        raise ValueError('positive finite compute budgets required')
    if (values == target_flops).any():
        return 'measured'
    return 'interpolated' if values.min() < target_flops < values.max() else 'extrapolated'
