# Generated starter; edit the functions in the course editor or notebook.
"""Complete small GPT forward pass. NumPy; no autograd in the browser."""
import numpy as np

def _norm(x):
    return (x - x.mean(axis=-1, keepdims=True)) / np.sqrt(x.var(axis=-1, keepdims=True) + 1e-05)

def decoder_logits(ids, embedding, positions, blocks, heads):
    """Return [B,T,V] logits for a tied-output, pre-norm causal decoder.

ids integer [B,T], embedding [V,D], positions [max_T,D], T<=max_T.
D divisible by positive heads. blocks is a list of dictionaries:
q,k,v,o: [D,D]; up: [D,F]; down: [F,D]. No biases or learned norm affine.
Each block: residual attention(norm(x)); then residual MLP(norm(x)).
MLP uses GELU approximation h/(1+exp(-1.702*h)). Final norm, then @E.T.
Assume valid finite shapes/IDs. Do not modify any inputs or parameters.
Compute numeric parameters in floating point; IDs remain integers."""
    raise NotImplementedError('Implement this function, then run the checks.')
