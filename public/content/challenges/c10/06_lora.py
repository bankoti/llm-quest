# Generated starter; edit the functions in the course editor or notebook.
"""LoRA with input-row matrix convention."""
import numpy as np

def lora_forward(x, weight, a, b, alpha):
    """Return x@weight + (alpha/r)*(x@a)@b.

x [...,din], weight [din,dout], a [din,r], b [r,dout], r>=1.
Assume finite float arrays with valid shapes and finite alpha.
Never mutate inputs. No bias/dropout in this browser exercise."""
    raise NotImplementedError('Implement this function, then run the checks.')

def merge_lora(weight, a, b, alpha):
    """Return a fresh weight + (alpha/r)*a@b, same contract as lora_forward."""
    raise NotImplementedError('Implement this function, then run the checks.')
