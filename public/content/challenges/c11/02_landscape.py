# Generated starter; edit the functions in the course editor or notebook.
"""Measured slices for yhat=w2*tanh(w1*x)."""
import numpy as np

def landscape(x, y, first_weights, second_weights):
    """Return MSE grid [len(first_weights),len(second_weights)].

Finite nonempty 1D x,y of equal length and finite 1D weight grids assumed.
Rows vary w1, columns vary w2. Average over examples only."""
    raise NotImplementedError('Implement this function, then run the checks.')

def numerical_gradient(loss, theta, epsilon=1e-05):
    """Central-difference gradient of scalar callable loss at 1D theta.

Positive finite epsilon, finite theta assumed. Do not mutate theta."""
    raise NotImplementedError('Implement this function, then run the checks.')
