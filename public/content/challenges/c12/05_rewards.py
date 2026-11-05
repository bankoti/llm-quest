# Generated starter; edit the functions in the course editor or notebook.
"""A narrow, bounded exact arithmetic reward. Never evaluate generated code."""
import re

def addition_reward(response, a, b):
    """Return 1.0 only for a single correct signed decimal integer, else 0.0.

response must be str of <=128 characters before stripping. Operands must
be Python ints, not bools, with abs(value)<=10^9. Invalid operands: ValueError.
Allow surrounding whitespace and leading zeros; grammar [+-]?[0-9]+.
Invalid/non-string/oversized responses get zero, not an exception."""
    raise NotImplementedError('Implement this function, then run the checks.')
