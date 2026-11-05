"""LoRA with input-row matrix convention."""
import numpy as np


def lora_forward(x, weight, a, b, alpha):
    """Return x@weight + (alpha/r)*(x@a)@b.

    x [...,din], weight [din,dout], a [din,r], b [r,dout], r>=1.
    Assume finite float arrays with valid shapes and finite alpha.
    Never mutate inputs. No bias/dropout in this browser exercise.
    """
    rank = a.shape[1]
    return x @ weight + (alpha / rank) * ((x @ a) @ b)


def merge_lora(weight, a, b, alpha):
    """Return a fresh weight + (alpha/r)*a@b, same contract as lora_forward."""
    return weight + (alpha / a.shape[1]) * (a @ b)
