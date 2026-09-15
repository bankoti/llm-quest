import numpy as np
EOT = 256

def byte_targets(logits, vocabulary, prefix=b'', use_eot=False):
    z = np.asarray(logits, dtype=np.float64)
    if (z.ndim != 1 or len(z) != len(vocabulary) or not len(z)
            or np.isnan(z).any() or np.isposinf(z).any()
            or not isinstance(prefix, bytes)
            or any(not isinstance(t, bytes) or not t for t in vocabulary)):
        raise ValueError('invalid logits, vocabulary, or prefix')
    if len(set(vocabulary)) != len(vocabulary):
        raise ValueError('vocabulary byte strings must be unique')
    indices, symbols = [], []
    for i, token in enumerate(vocabulary):
        if token.startswith(prefix):
            if len(token) > len(prefix):
                indices.append(i)
                symbols.append(token[len(prefix)])
            elif use_eot:
                indices.append(i)
                symbols.append(EOT)
    if not indices or not np.isfinite(z[indices]).any():
        raise ValueError('prefix has no positive eligible probability')
    # Condition BEFORE exponentiation so an unlikely prefix does not underflow.
    selected = z[indices]
    weights = np.exp(selected - selected.max())
    weights /= weights.sum()
    return np.bincount(symbols, weights=weights, minlength=257 if use_eot else 256)

def distillation_kl(student_logits, teacher_targets):
    z, p = np.asarray(student_logits, dtype=np.float64), np.asarray(teacher_targets, dtype=np.float64)
    if (z.ndim != 2 or z.shape != p.shape or min(z.shape) == 0
            or not np.isfinite(z).all() or not np.isfinite(p).all()
            or (p < 0).any() or not np.allclose(p.sum(1), 1, atol=1e-8, rtol=0)):
        raise ValueError('expected finite logits and normalized target rows')
    shifted = z - z.max(1, keepdims=True)
    log_q = shifted - np.log(np.exp(shifted).sum(1, keepdims=True))
    log_p = np.log(np.where(p > 0, p, 1))
    return float(np.sum(p * (log_p - log_q), axis=1).mean())
