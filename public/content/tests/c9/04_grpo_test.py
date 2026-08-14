# auto-grader
import math

rewards = [0.1, 0.8, 0.3, 0.6, 0.2]
adv = grpo_advantages(rewards)
assert len(adv) == 5, "must return one advantage per reward"
assert abs(sum(adv)) < 1e-6, f"advantages must sum to 0: {sum(adv)}"
assert abs(adv[1] - max(adv)) < 1e-9, "highest reward -> highest advantage"
assert abs(sum(a**2 for a in adv)/len(adv) - 1.0) < 1e-6, "unit variance"

# All same -> all zero
same = grpo_advantages([0.5, 0.5, 0.5])
assert all(a == 0 for a in same), "identical rewards -> zero advantages"

# KL penalty
kl = kl_penalty(math.log(0.4), math.log(0.5))
assert kl >= 0, f"KL penalty must be non-negative: {kl}"

# GRPO loss: positive advantages on high-prob tokens should give lower loss
log_probs = [-0.5, -1.0, -0.3]
advs      = [1.0,  0.0, -1.0]
refs      = [-0.6, -1.0, -0.3]
loss = grpo_loss(log_probs, advs, refs, kl_coeff=0.0)
assert isinstance(loss, float), "loss must be a float"

print(f"Advantages: {[round(a,3) for a in adv]}")
print(f"KL penalty (0.4 vs 0.5): {kl:.4f}")
print(f"GRPO loss (no KL):       {loss:.4f}")
print("\n+200 XP — GRPO complete.")
