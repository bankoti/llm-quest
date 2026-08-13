"""Level 1 — Tensors & Shapes
Prove you can read tensor shapes before writing a model line.
Use only numpy — no loops.
"""
import numpy as np

B, T, C, H = 2, 5, 12, 3
np.random.seed(1)
x = np.random.randn(B, T, C)

# TODO 1: Keep all batches/channels, last 2 time positions. Shape: (B, 2, C)
last_two = ...

# TODO 2: Split C into H heads, move head axis before time.
# reshape to (B,T,H,C//H) then transpose axes 1 and 2. Shape: (B, H, T, C//H)
heads = ...

# TODO 3: (B,H,T,T) similarity — last two axes: (T,D) @ (D,T)
scores = ...
