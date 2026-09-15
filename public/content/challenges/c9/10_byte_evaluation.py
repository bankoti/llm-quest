"""Compare raw content, not incompatible token counts. No model is needed."""
import numpy as np

def bits_per_byte(nll_nats, content_bytes):
    """Sum a nonempty 1-D vector of finite nonnegative NLLs / (bytes * ln(2)).
    content_bytes is a positive integer excluding BOS/EOT/padding symbols.
    Invalid inputs raise ValueError. NLL includes any predicted EOT symbols.
    This scores the declared representation, not marginalized raw-text likelihood.
    """
    raise NotImplementedError

def logit_storage(positions, vocab_size, top_k=None):
    """Logit payload bytes: dense FP32, or top-k FP32 values + int32 indices.
    positions and vocab_size must be positive integers. top_k is None or an
    integer 1..vocab_size. Invalid inputs raise ValueError. Excludes text,
    token IDs, filesystem metadata, compression, and teacher-generation cost.
    """
    raise NotImplementedError

def serving_summary(content_bytes, elapsed_ms):
    """Equal-length nonempty 1-D lists for completed SEQUENTIAL requests.
    Byte counts are positive integers; times finite and positive. Return dict:
    bytes_per_second = 1000 * total bytes / total milliseconds;
    p95_ms = sorted times[ceil(0.95 * n) - 1] (nearest-rank convention).
    Reject invalid inputs with ValueError. No concurrency claim is made.
    """
    raise NotImplementedError

def evidence_region(measured_flops, target_flops):
    """Positive finite compute values; measured_flops is a nonempty 1-D list.
    Return 'measured' for an exact sampled budget, 'interpolated' strictly
    inside its min/max, otherwise 'extrapolated'. Invalid inputs: ValueError.
    This labels the location, not the accuracy or confidence of a fitted model.
    """
    raise NotImplementedError
