# Generated starter; edit the functions in the course editor or notebook.
"""One prompt group, original response-weighted clipped GRPO surrogate."""
import numpy as np

def clipped_grpo(logp, old_logp, reference_logp, rewards, mask, epsilon=0.2, beta=0.01):
    """Return dict loss, advantages, ratios, kl, clip_fraction.

Log arrays finite [G,T], rewards finite [G], Boolean mask [G,T]. G>=2;
each response has >=1 valid token. 0<epsilon<1, beta>=0; invalid: ValueError.
Population std with +1e-8. Loss=-mean_G(mean_valid(min(r*A,clip(r)*A)-beta*KL)).
KL=exp(reference_logp-logp)-(reference_logp-logp)-1. Padded entries in
ratios/kl are zero, and must not be exponentiated. clip_fraction is the
fraction of valid ratios outside [1-epsilon,1+epsilon]. No input mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')
