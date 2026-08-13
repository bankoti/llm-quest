"""Level 1 — Tensors & Shapes
Prove you can read tensor shapes before writing a model line.
Use only numpy — no loops.

AI-friendly: ask an assistant anything. But decide the shape you expect
BEFORE you run — predicting shapes is the skill, typing is not.
"""
import numpy as np

B, T, C, H = 2, 5, 12, 3   # batch, time, channels, heads
np.random.seed(1)
x = np.random.randn(B, T, C)

# TODO 1: The model only needs the 2 most recent time steps of every
# sequence in the batch. Produce that view. Expected shape: (B, 2, C)
last_two = ...

# TODO 2: Attention runs H heads in parallel. Reorganise x so each head
# owns its own C//H channels and heads act like an extra batch dimension.
# Expected shape: (B, H, T, C//H)
heads = ...

# TODO 3: Each head must compare every position with every position.
# Build that similarity matrix from `heads`. Expected shape: (B, H, T, T)
scores = ...
