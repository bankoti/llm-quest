"""Token-to-byte targets. CPU NumPy; no model download required.

Vocabulary entries are unique, nonempty bytes objects, not Unicode characters.
EOT=256 is a separate symbol, not a UTF-8 byte or end-of-sequence marker.
"""
import numpy as np
EOT = 256

def byte_targets(logits, vocabulary, prefix=b'', use_eot=False):
    """Return a float vector of length 256 (approximate) or 257 (with EOT).

    Condition on vocabulary entries starting with prefix. Entries ending at
    prefix contribute to EOT when enabled; otherwise discard their mass.
    Sum probabilities by NEXT byte/symbol and normalize over eligible entries.
    Normalize eligible logits stably, even if larger logits exist elsewhere.
    logits: 1-D, one per vocabulary entry; finite or -inf (zero mass).
    Reject empty/duplicate/non-bytes entries, non-bytes prefix, bad logit shape,
    NaN/+inf, and prefixes with no positive eligible mass using ValueError.
    Do not mutate inputs. The empty prefix is valid; empty tokens are not.
    """
    raise NotImplementedError

def distillation_kl(student_logits, teacher_targets):
    """Mean forward KL(teacher || student), in nats, over rows, temperature 1.

    Both inputs have shape (positions, vocabulary_size), with nonempty axes.
    Student logits must be finite. Targets must be finite, nonnegative, and
    each row sum to 1 within atol=1e-8 (rtol=0). Zero targets contribute zero.
    Reject invalid inputs with ValueError. Use stable log-softmax, not log of
    rounded probabilities. Preserve inputs.
    """
    raise NotImplementedError
