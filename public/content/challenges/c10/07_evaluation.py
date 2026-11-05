# Generated starter; edit the functions in the course editor or notebook.
"""Explicit top-k then nucleus sampling distribution."""
import numpy as np

def decoding_probs(logits, temperature=1.0, top_k=None, top_p=1.0):
    """Return probabilities in original vocabulary order from finite 1D logits.

Nonempty logits; temperature>0; 0<top_p<=1; top_k None or integer 1..V.
Apply temperature, top-k, normalize, then top-p and normalize again.
Descending ties prefer smaller IDs. Include the nucleus crossing token.
Reject invalid arguments with ValueError; do not mutate logits."""
    raise NotImplementedError('Implement this function, then run the checks.')
