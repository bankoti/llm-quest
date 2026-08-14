# auto-grader
import math

ls = log_sigmoid(0.0)
assert abs(ls - math.log(0.5)) < 1e-6, f"log_sigmoid(0): {ls}"
ls_large = log_sigmoid(100.0)
assert ls_large > -1e-6, f"log_sigmoid(100) should be ~0: {ls_large}"

# DPO loss: chosen clearly better
loss_good = dpo_loss(-1.0, -3.0, -1.5, -2.5, beta=0.1)
loss_bad  = dpo_loss(-3.0, -1.0, -1.5, -2.5, beta=0.1)
assert loss_good < loss_bad, "loss should be lower when chosen > rejected"

# At zero margin, loss = log(2)
# log_pi_c - log_pi_ref_c = log_pi_r - log_pi_ref_r -> margin=0
loss_zero = dpo_loss(-1.0, -2.0, -1.0, -2.0, beta=0.5)
assert abs(loss_zero - math.log(2)) < 1e-4, f"zero-margin loss: {loss_zero:.4f}"

r = dpo_implicit_reward(-1.0, -1.5, beta=0.1)
assert abs(r - 0.05) < 1e-6, f"implicit reward: {r}"

print(f"DPO loss (good pair): {loss_good:.4f}")
print(f"DPO loss (bad pair):  {loss_bad:.4f}")
print(f"Zero-margin loss:     {loss_zero:.4f} (should be {math.log(2):.4f})")
print("\n+200 XP — DPO Loss complete.")
