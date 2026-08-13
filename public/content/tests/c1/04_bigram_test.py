import numpy as np
np.random.seed(4)
V = 11
embedding = np.zeros((V,V))
inputs  = np.random.randint(0,V,(4,8))
targets = np.random.randint(0,V,(4,8))
logits, loss = bigram_forward(inputs, embedding, targets)
assert logits.shape == (4,8,V), f"logits shape: {logits.shape}"
assert loss is not None
assert abs(loss - np.log(V)) < 1e-5, f"uniform -> loss=log({V}), got {loss:.4f}"
_, no_loss = bigram_forward(inputs, embedding)
assert no_loss is None
print("✓ logits shape correct")
print("✓ uniform init -> loss = log(vocab_size)")
print("✓ no targets -> no loss")
print("\n+120 XP — Bigram Baseline complete.")
