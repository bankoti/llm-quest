"""One prompt group, original response-weighted clipped GRPO surrogate."""
import numpy as np


def _group_advantages(rewards):
    """Normalize finite group rewards while retaining additive epsilon units.

    Center reference differences before scaling to preserve representable gaps.
    Scale original rewards only if subtraction, mean, or centering is nonfinite.
    This float64 helper is supplied so the exercise focuses on GRPO composition.
    """
    with np.errstate(over='ignore', invalid='ignore', under='ignore'):
        differences = rewards-rewards[0]
        centered = differences-differences.mean()
        epsilon = 1e-8
        if not np.isfinite(centered).all():
            original_scale = max(float(np.abs(rewards).max()), epsilon)
            differences = rewards/original_scale
            differences = differences-differences[0]
            centered = differences-differences.mean()
            epsilon /= original_scale
        scale = max(float(np.abs(centered).max()), epsilon)
        if scale == 0:
            return np.zeros_like(rewards)
        centered = centered/scale
        return centered/(np.sqrt(np.mean(centered**2))+epsilon/scale)


def clipped_grpo(logp, old_logp, reference_logp, rewards, mask, epsilon=.2, beta=.01):
    """Return dict loss, advantages, ratios, kl, clip_fraction.

    Log arrays finite [G,T], rewards finite [G], Boolean mask [G,T]. G>=2;
    each response has >=1 valid token. 0<epsilon<1, beta>=0; invalid: ValueError.
    Population std with +1e-8. Loss=-mean_G(mean_valid(min(r*A,clip(r)*A)-beta*KL)).
    KL=exp(reference_logp-logp)-(reference_logp-logp)-1. Padded entries in
    ratios/kl are zero, and must not be exponentiated. clip_fraction is the
    fraction of valid ratios outside [1-epsilon,1+epsilon]. No input mutation.
    Zero advantages contribute zero surrogate, and beta=0 omits the KL penalty.
    The supplied normalization helper centers reference reward differences
    before scaling and preserves +1e-8 in the original reward units.
    Ratios/KL diagnostics may be +inf when their float64 arithmetic overflows.
    An overflowing ratio is supported only for zero/positive advantages; an
    overflowing KL only when beta=0. Otherwise raise FloatingPointError, even
    if a smaller advantage/beta could make the weighted term representable.
    Nonfinite token objectives/loss also raise; never silently cap these terms.
    """
    z, old, ref = [np.asarray(v, float) for v in (logp, old_logp, reference_logp)]
    rewards, m = np.asarray(rewards, float), np.asarray(mask)
    if z.ndim != 2 or old.shape != z.shape or ref.shape != z.shape or m.shape != z.shape or rewards.shape != (z.shape[0],) or z.shape[0] < 2 or m.dtype.kind != 'b' or not m.any(axis=1).all():
        raise ValueError('invalid group shapes or masks')
    if not 0 < epsilon < 1 or not np.isfinite(beta) or beta < 0 or not all(np.isfinite(v).all() for v in (z, old, ref, rewards)):
        raise ValueError('invalid objective inputs')
    advantages = _group_advantages(rewards)
    ratios, kl = np.zeros_like(z), np.zeros_like(z)
    with np.errstate(over='ignore', invalid='ignore'):
        ratios[m] = np.exp(z[m]-old[m])
        delta = ref[m]-z[m]
        valid_kl = np.full_like(delta, np.inf)
        finite_delta = np.isfinite(delta)
        valid_kl[finite_delta] = np.expm1(delta[finite_delta])-delta[finite_delta]
        kl[m] = valid_kl
        a = np.broadcast_to(advantages[:, None], z.shape)[m]
        signed_ratio = np.where(a > 0, np.minimum(ratios[m], 1+epsilon),
                                np.maximum(ratios[m], 1-epsilon))
        surrogate = np.zeros_like(a)
        np.multiply(signed_ratio, a, out=surrogate, where=a != 0)
        penalty = beta*valid_kl if beta else np.zeros_like(valid_kl)
        objective = surrogate-penalty
        if not all(np.isfinite(v).all() for v in (surrogate, penalty, objective)):
            raise FloatingPointError('GRPO objective exceeds float64 range')
        terms = np.zeros_like(z)
        terms[m] = objective
        loss = -np.sum((terms/m.sum(-1)[:, None])/len(rewards))
    if not np.isfinite(loss):
        raise FloatingPointError('GRPO loss exceeds float64 range')
    fraction = np.mean((ratios[m] < 1-epsilon) | (ratios[m] > 1+epsilon))
    return dict(loss=float(loss), advantages=advantages, ratios=ratios, kl=kl, clip_fraction=float(fraction))
