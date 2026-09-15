import math
import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def route(expert_outputs, router_logits, k):
    indices = np.argsort(-router_logits, axis=1, kind='stable')[:, :k]
    selected = np.take_along_axis(router_logits, indices, axis=1)
    weights = softmax(selected)
    outputs = expert_outputs[np.arange(len(indices))[:, None], indices]
    return (outputs * weights[..., None]).sum(axis=1)

def switch_forward(x, router_logits, experts, capacity_factor=1.0):
    if capacity_factor <= 0:
        raise ValueError('capacity_factor must be positive')
    t, e = router_logits.shape
    p = softmax(router_logits)
    selected = p.argmax(axis=1)
    capacity = math.ceil(capacity_factor * t / e)
    output = np.zeros_like(x, dtype=float)
    accepted = np.zeros(t, dtype=bool)
    for i, expert in enumerate(experts):
        positions = np.flatnonzero(selected == i)[:capacity]
        if len(positions):
            output[positions] = expert(x[positions]) * p[positions, i, None]
            accepted[positions] = True
    fraction = np.bincount(selected, minlength=e) / t
    auxiliary = e * np.sum(fraction * p.mean(axis=0))
    return output, accepted, float(auxiliary)
