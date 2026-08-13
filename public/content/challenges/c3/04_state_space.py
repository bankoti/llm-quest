"""Level 17 — State Space Models
Fixed-size state updated by recurrence. O(1) memory vs O(T) for KV cache.
"""
import numpy as np

def ssm_step(x_t, h_prev, A, B, C):
    """h_t = A@h_prev + B@x_t; y_t = C@h_t. Returns (h_t, y_t)."""
    raise NotImplementedError

def ssm_scan(inputs, A, B, C):
    """Run SSM over (T, width) inputs. Returns (T, width) outputs."""
    raise NotImplementedError
