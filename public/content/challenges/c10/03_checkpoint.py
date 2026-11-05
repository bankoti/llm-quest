# Generated starter; edit the functions in the course editor or notebook.
"""Explicit local weight-import contract; no deserialization of external files."""
import numpy as np

def import_weights(source, shapes, mapping):
    """Return copied destination arrays from an explicit tensor mapping.

source: {name: finite ndarray}; shapes: {destination: expected shape tuple}.
mapping: {destination: (source_name, transpose_bool)}. A transpose requires
a 2D array. Every source and destination must occur exactly once.
Reject missing/extra keys, repeated sources, invalid flags, nonfinite values,
or wrong shapes with ValueError. Do not mutate/alias source arrays."""
    raise NotImplementedError('Implement this function, then run the checks.')

def validate_checkpoint(checkpoint, config, tokenizer_id):
    """Validate a metadata envelope and return completed update count.

Require keys model, optimizer, rng, cursor, step, config, tokenizer_id.
config and tokenizer_id must exactly equal expected values. step/cursor
are nonnegative integers (not bool). Missing keys/mismatch: ValueError.
This checks metadata only, not tensor integrity or deserialization safety."""
    raise NotImplementedError('Implement this function, then run the checks.')
