# Generated starter; edit the functions in the course editor or notebook.
"""Constructive clock circuit, separate from learning the circuit."""
import numpy as np

def clock_sum(a, b, modulus):
    """Return (2D sum feature, decoded ID) via trigonometric addition.

a,b are integers in [0,modulus), modulus integer >=2. Invalid: ValueError.
Feature is [cos(theta_a+theta_b), sin(theta_a+theta_b)], constructed from
separate sin/cos of a and b. Decode by candidate clock dot products."""
    raise NotImplementedError('Implement this function, then run the checks.')
