import numpy as np
tokens = np.arange(100)
rng = np.random.default_rng(42)
x, y = get_batch(tokens, batch_size=4, block_size=8, rng=rng)
assert x.shape == (4,8), f"inputs shape: {x.shape}"
assert y.shape == (4,8), f"targets shape: {y.shape}"
assert np.array_equal(x[:,1:], y[:,:-1]), "targets must be inputs shifted by one"
assert np.all(y[:,-1] == x[:,-1]+1)
print("✓ shapes correct")
print("✓ targets are inputs shifted by one")
print("\n+100 XP — Data & Batching complete.")
