import numpy as np
np.random.seed(1)
B,T,C,H = 2,5,12,3

assert last_two.shape == (B,2,C), f"last_two: got {last_two.shape}"
assert heads.shape == (B,H,T,C//H), f"heads: got {heads.shape}"
assert scores.shape == (B,H,T,T), f"scores: got {scores.shape}"
print("✓ last_two shape correct")
print("✓ heads shape correct")
print("✓ scores shape correct")
print("\n+100 XP — Tensors & Shapes complete.")
