"""Inspectable single-channel convolution and row-major patchification."""
import numpy as np


def conv_valid(image, kernel):
    """Valid stride-one cross-correlation, no kernel flip, bias, or activation.

    Finite 2D image [H,W], finite kernel [Kh,Kw] fitting the image, valid shapes
    assumed. Return [H-Kh+1,W-Kw+1]. Do not mutate inputs.
    """
    kh, kw = kernel.shape
    return np.array([[np.sum(image[i:i+kh,j:j+kw]*kernel) for j in range(image.shape[1]-kw+1)] for i in range(image.shape[0]-kh+1)])


def patchify(image, size):
    """Return nonoverlapping flattened patches [num_patches,size*size].

    Single-channel 2D image. Row-major patch order and row-major within each.
    Positive integer size must divide H and W; otherwise ValueError.
    """
    if not isinstance(size,int) or isinstance(size,bool) or size < 1 or image.ndim != 2 or any(n % size for n in image.shape):
        raise ValueError('patch size must divide both image dimensions')
    h,w = image.shape
    return image.reshape(h//size,size,w//size,size).transpose(0,2,1,3).reshape(-1,size*size).copy()
