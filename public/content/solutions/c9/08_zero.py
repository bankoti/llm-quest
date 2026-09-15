import numpy as np

def zero_memory(params, ranks, stage):
    if params < 0 or ranks <= 0 or stage not in (0, 1, 2, 3):
        raise ValueError('invalid parameter count, rank count, or stage')
    shard = (params + ranks - 1) // ranks
    return {'weights': 2 * (shard if stage >= 3 else params),
            'gradients': 2 * (shard if stage >= 2 else params),
            'optimizer': 12 * (shard if stage >= 1 else params)}

def sharded_adam_step(params, rank_gradients, moments, variances, step, lr=0.01):
    # This centralized average models reduce-scatter, not its communication cost.
    gradient = np.mean(rank_gradients, axis=0)
    new_params, new_m, new_v = [], [], []
    start = 0
    for p, m, v in zip(params, moments, variances):
        g = gradient[start:start + len(p)]
        m = .9 * m + .1 * g
        v = .999 * v + .001 * g * g
        update = (m / (1 - .9 ** step)) / (np.sqrt(v / (1 - .999 ** step)) + 1e-8)
        new_params.append(p - lr * update)
        new_m.append(m)
        new_v.append(v)
        start += len(p)
    return new_params, new_m, new_v
