import numpy as np
rng = np.random.default_rng(48)
for din, dout, rank in [(3, 7, 2), (8, 4, 1), (4, 4, 3)]:
    x, w = rng.normal(size=(2, 5, din)), rng.normal(size=(din, dout))
    a, b = rng.normal(size=(din, rank)), rng.normal(size=(rank, dout))
    before = w.copy()
    delta = sum(np.outer(a[:, k], b[k]) for k in range(rank)) * (5 / rank)
    expected = x @ (w + delta)
    assert np.allclose(lora_forward(x, w, a, b, 5), expected), 'Apply the scaled nonzero adapter'
    merged = merge_lora(w, a, b, 5)
    assert np.allclose(merged, w + delta)
    assert np.allclose(x @ merged, lora_forward(x, w, a, b, 5))
    assert np.allclose(lora_forward(x, w, a, np.zeros_like(b), 5), x @ w)
    merged[:] = 0
    assert np.array_equal(w, before), 'Do not modify frozen base weights'
print('LoRA checks passed.')
