"""Measured slices for yhat=w2*tanh(w1*x)."""
import numpy as np


def landscape(x, y, first_weights, second_weights):
    """Return MSE grid [len(first_weights),len(second_weights)].

    Finite nonempty 1D x,y of equal length and finite 1D weight grids assumed.
    Rows vary w1, columns vary w2. Average over examples only.
    """
    x, y, first_weights, second_weights = [np.asarray(values, float) for values in (x, y, first_weights, second_weights)]
    predictions = np.tanh(first_weights[:, None, None] * x[None, None, :]) * second_weights[None, :, None]
    return ((predictions - y)**2).mean(axis=-1)


def numerical_gradient(loss, theta, epsilon=1e-5):
    """Central-difference gradient of scalar callable loss at 1D theta.

    Positive finite epsilon, finite theta assumed. Do not mutate theta.
    """
    theta = np.asarray(theta, float)
    gradient = np.empty_like(theta)
    for i in range(len(theta)):
        delta = np.zeros_like(theta); delta[i] = epsilon
        gradient[i] = (loss(theta + delta) - loss(theta - delta)) / (2 * epsilon)
    return gradient
