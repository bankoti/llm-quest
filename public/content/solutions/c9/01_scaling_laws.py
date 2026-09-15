import math

def chinchilla_optimal(compute_flops):
    n = int(math.sqrt(compute_flops / 120))
    return {'params': n, 'tokens': 20 * n}

def training_flops(params, tokens):
    return 6 * params * tokens

def inference_memory_gb(params, bytes_per_param=2):
    return params * bytes_per_param / 1e9

def budget_tokens(compute_flops, params):
    if params <= 0 or compute_flops < 0:
        raise ValueError('invalid budget or parameter count')
    return int(compute_flops // (6 * params))
