"""One prompt group, original response-weighted clipped GRPO surrogate."""
import numpy as np


def clipped_grpo(logp, old_logp, reference_logp, rewards, mask, epsilon=.2, beta=.01):
    """Return dict loss, advantages, ratios, kl, clip_fraction.

    Log arrays finite [G,T], rewards finite [G], Boolean mask [G,T]. G>=2;
    each response has >=1 valid token. 0<epsilon<1, beta>=0; invalid: ValueError.
    Population std with +1e-8. Loss=-mean_G(mean_valid(min(r*A,clip(r)*A)-beta*KL)).
    KL=exp(reference_logp-logp)-(reference_logp-logp)-1. Padded entries in
    ratios/kl are zero, and must not be exponentiated. clip_fraction is the
    fraction of valid ratios outside [1-epsilon,1+epsilon]. No input mutation.
    """
    z, old, ref = [np.asarray(v, float) for v in (logp, old_logp, reference_logp)]
    rewards, m = np.asarray(rewards, float), np.asarray(mask)
    if z.ndim != 2 or old.shape != z.shape or ref.shape != z.shape or m.shape != z.shape or rewards.shape != (z.shape[0],) or z.shape[0] < 2 or m.dtype.kind != 'b' or not m.any(axis=1).all():
        raise ValueError('invalid group shapes or masks')
    if not 0 < epsilon < 1 or not np.isfinite(beta) or beta < 0 or not all(np.isfinite(v).all() for v in (z, old, ref, rewards)):
        raise ValueError('invalid objective inputs')
    advantages = (rewards-rewards.mean())/(rewards.std()+1e-8)
    ratios, kl = np.zeros_like(z), np.zeros_like(z)
    ratios[m] = np.exp(z[m]-old[m])
    delta = ref[m]-z[m]
    kl[m] = np.expm1(delta)-delta
    a = advantages[:, None]
    objective = np.minimum(ratios*a, np.clip(ratios,1-epsilon,1+epsilon)*a)-beta*kl
    loss = -np.mean(np.where(m, objective, 0).sum(-1)/m.sum(-1))
    fraction = np.mean((ratios[m] < 1-epsilon) | (ratios[m] > 1+epsilon))
    return dict(loss=float(loss), advantages=advantages, ratios=ratios, kl=kl, clip_fraction=float(fraction))
