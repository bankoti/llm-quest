# Generated starter; edit the functions in the course editor or notebook.
"""Masked latent prediction and EMA target mechanics."""
import numpy as np

def latent_mse(prediction, target, mask):
    """Mean squared feature error over selected [B,T] target positions.

prediction/target matching finite [B,T,D], Boolean mask [B,T]. Reject
mismatched shapes, nonfinite values, or empty mask with ValueError.
Average over selected positions AND D features. Do not mutate arrays.
Convert prediction and target to floating point before arithmetic."""
    raise NotImplementedError('Implement this function, then run the checks.')

def ema_target(target, online, momentum):
    """Return fresh m*target+(1-m)*online. Matching finite arrays assumed.

Require finite 0<=momentum<=1, else ValueError. No input mutation.
This is an update rule, not proof of noncollapse."""
    raise NotImplementedError('Implement this function, then run the checks.')
