import numpy as np

def score_matrix_bytes(batch, heads, tokens, bytes_per_value):
    return batch * heads * tokens * tokens * bytes_per_value

def tile_bytes(query_rows, key_rows, head_size, bytes_per_value):
    return (query_rows * head_size + 2 * key_rows * head_size + query_rows * key_rows) * bytes_per_value

def tiled_attention(q, k, v, block_size=2):
    if block_size <= 0:
        raise ValueError('block_size must be positive')
    q, k, v = [np.asarray(x, dtype=np.float64) for x in (q, k, v)]
    t, d = q.shape
    output = np.empty((t, v.shape[1]))
    for start in range(0, t, block_size):
        stop = min(start + block_size, t)
        rows = np.arange(start, stop)
        m = np.full(stop - start, -np.inf)
        l = np.zeros(stop - start)
        a = np.zeros((stop - start, v.shape[1]))
        for col in range(0, stop, block_size):
            end = min(col + block_size, t)
            scores = q[start:stop] @ k[col:end].T / np.sqrt(d)
            scores = np.where(rows[:, None] >= np.arange(col, end), scores, -np.inf)
            # Old and new contributions must share the same exponential scale.
            new_m = np.maximum(m, scores.max(axis=1))
            correction = np.exp(m - new_m)
            p = np.exp(scores - new_m[:, None])
            l = correction * l + p.sum(axis=1)
            a = correction[:, None] * a + p @ v[col:end]
            m = new_m
        output[start:stop] = a / l[:, None]
    return output
