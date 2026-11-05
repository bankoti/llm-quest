"""Constructive clock circuit, separate from learning the circuit."""
import numpy as np


def clock_sum(a, b, modulus):
    """Return (2D sum feature, decoded ID) via trigonometric addition.

    a,b are integers in [0,modulus), modulus integer >=2. Invalid: ValueError.
    Feature is [cos(theta_a+theta_b), sin(theta_a+theta_b)], constructed from
    separate sin/cos of a and b. Decode by candidate clock dot products.
    """
    if any(not isinstance(v, int) or isinstance(v, bool) for v in (a, b, modulus)) or modulus < 2 or not 0 <= a < modulus or not 0 <= b < modulus:
        raise ValueError('invalid modular operands')
    aa, bb = 2*np.pi*a/modulus, 2*np.pi*b/modulus
    feature = np.array([np.cos(aa)*np.cos(bb)-np.sin(aa)*np.sin(bb), np.sin(aa)*np.cos(bb)+np.cos(aa)*np.sin(bb)])
    angles = 2*np.pi*np.arange(modulus)/modulus
    candidates = np.stack([np.cos(angles), np.sin(angles)], axis=1)
    return feature, int(np.argmax(candidates @ feature))
