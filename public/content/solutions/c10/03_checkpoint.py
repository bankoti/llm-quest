"""Explicit local weight-import contract; no deserialization of external files."""
import numpy as np


def import_weights(source, shapes, mapping):
    """Return copied destination arrays from an explicit tensor mapping.

    source: {name: finite ndarray}; shapes: {destination: expected shape tuple}.
    mapping: {destination: (source_name, transpose_bool)}. A transpose requires
    a 2D array. Every source and destination must occur exactly once.
    Reject missing/extra keys, repeated sources, invalid flags, nonfinite values,
    or wrong shapes with ValueError. Do not mutate/alias source arrays.
    """
    if set(mapping) != set(shapes):
        raise ValueError('destination mapping mismatch')
    names = [entry[0] for entry in mapping.values()]
    if set(names) != set(source) or len(names) != len(set(names)):
        raise ValueError('source mapping must be bijective')
    result = {}
    for destination, (name, transpose) in mapping.items():
        value = np.asarray(source[name])
        if not isinstance(transpose, bool) or (transpose and value.ndim != 2):
            raise ValueError('transpose requires a matrix and Boolean flag')
        value = value.T if transpose else value
        if value.shape != tuple(shapes[destination]) or not np.isfinite(value).all():
            raise ValueError('incompatible tensor')
        result[destination] = value.copy()
    return result


def validate_checkpoint(checkpoint, config, tokenizer_id):
    """Validate a metadata envelope and return completed update count.

    Require keys model, optimizer, rng, cursor, step, config, tokenizer_id.
    config and tokenizer_id must exactly equal expected values. step/cursor
    are nonnegative integers (not bool). Missing keys/mismatch: ValueError.
    This checks metadata only, not tensor integrity or deserialization safety.
    """
    required = {'model', 'optimizer', 'rng', 'cursor', 'step', 'config', 'tokenizer_id'}
    if not required <= checkpoint.keys() or checkpoint['config'] != config or checkpoint['tokenizer_id'] != tokenizer_id:
        raise ValueError('incompatible checkpoint metadata')
    for key in ('step', 'cursor'):
        value = checkpoint[key]
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise ValueError('invalid progress state')
    return checkpoint['step']
