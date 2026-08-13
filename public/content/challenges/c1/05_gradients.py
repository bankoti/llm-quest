"""Level 5 — Gradients & Optimisation
One parameter. One loss. Derive the gradient yourself.
"""
import numpy as np

def predict(weight: float) -> float:
    return weight * 3.0

def mse_loss(prediction: float, target: float) -> float:
    """(prediction - target)^2"""
    raise NotImplementedError

def dloss_dweight(weight: float, target: float) -> float:
    """Chain rule: d/dw (w*3 - target)^2 = 2*(w*3 - target)*3"""
    raise NotImplementedError

# Training loop
target = 12.0
lr = 0.1
weight = 0.0
for step in range(20):
    loss = mse_loss(predict(weight), target)
    grad = dloss_dweight(weight, target)
    weight -= lr * grad
    print(f"step={step:02d} loss={loss:8.4f} grad={grad:8.4f} w={weight:7.4f}")
