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
for seed in [14, 29]:
    rng = np.random.default_rng(seed)
    embedding = rng.normal(size=(V,V))*4
    inputs = rng.integers(V,size=(3,5)); targets = rng.integers(V,size=(3,5))
    logits, loss = bigram_forward(inputs,embedding,targets)
    assert np.array_equal(logits,embedding[inputs]), 'Bigram logits are the selected embedding rows'
    terms = []
    for row,target in zip(embedding[inputs].reshape(-1,V),targets.ravel()):
        shifted = row-row.max()
        terms.append(np.log(np.exp(shifted).sum())-shifted[target])
    assert np.isclose(loss,np.mean(terms)), 'Use actual target likelihoods, not the uniform baseline'
    assert np.isclose(cross_entropy(logits.reshape(-1,V),targets.ravel()),np.mean(terms))
print("✓ logits shape correct")
print("✓ uniform init -> loss = log(vocab_size)")
print("✓ no targets -> no loss")
print("\n+120 XP — Bigram Baseline complete.")
