# Generated starter; edit the functions in the course editor or notebook.
"""Inspectable single-channel convolution and row-major patchification."""
import numpy as np

def conv_valid(image, kernel):
    """Valid stride-one cross-correlation, no kernel flip, bias, or activation.

Finite 2D image [H,W], finite kernel [Kh,Kw] fitting the image, valid shapes
assumed. Return floating-point [H-Kh+1,W-Kw+1], computing products in
floating point even for integer inputs. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def patchify(image, size):
    """Return nonoverlapping flattened patches [num_patches,size*size].

Single-channel 2D image. Row-major patch order and row-major within each.
Positive integer size must divide H and W; otherwise ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')
