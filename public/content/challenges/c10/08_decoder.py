# Generated starter; edit the functions in the course editor or notebook.
"""Complete small GPT forward pass. NumPy; no autograd in the browser."""
import numpy as np

def _norm(x):
    if not np.isfinite(x).all():
        raise FloatingPointError('Nonfinite decoder residual')
    with np.errstate(over='ignore', invalid='ignore'):
        scale = np.maximum(np.max(np.abs(x), axis=-1, keepdims=True), np.sqrt(1e-05))
        scaled = x / scale
        centered = scaled - scaled.mean(axis=-1, keepdims=True)
        denominator = np.hypot(np.sqrt(np.mean(centered ** 2, axis=-1, keepdims=True)), np.sqrt(1e-05) / scale)
        normalized = np.divide(centered, denominator, out=np.zeros_like(centered), where=denominator != 0)
    if not np.isfinite(normalized).all():
        raise FloatingPointError('Decoder normalization exceeds float64 range')
    return normalized

def decoder_logits(ids, embedding, positions, blocks, heads):
    """Return [B,T,V] logits for a tied-output, pre-norm causal decoder.

ids integer [B,T], embedding [V,D], positions [max_T,D], T<=max_T.
D divisible by positive heads. blocks is a list of dictionaries:
q,k,v,o: [D,D]; up: [D,F]; down: [F,D]. No biases or learned norm affine.
Each block: residual attention(norm(x)); then residual MLP(norm(x)).
MLP uses GELU approximation h/(1+exp(-1.702*h)). Final norm, then @E.T.
Assume valid finite shapes/IDs. Do not modify any inputs or parameters.
Compute numeric parameters in floating point; IDs remain integers.
Negative infinite MLP preactivations from overflow use the activation
limit zero. Raise FloatingPointError for nonrepresentable attention
intermediates, NaN preactivations, nonfinite active activations, residuals,
or output logits. Row normalization scales before measuring variance."""
    raise NotImplementedError('Implement this function, then run the checks.')
