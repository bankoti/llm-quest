import numpy as np
kv=np.array([[[[1.]],[[2.]]]])
exp=repeat_kv(kv,2)
assert exp.shape==(1,4,1,1),f"shape: {exp.shape}"
assert exp[0,:,0,0].tolist()==[1.,1.,2.,2.],f"values: {exp[0,:,0,0]}"
m=causal_mask(4)
assert m[0,0] and not m[0,1]
assert m[3,0]
wm=causal_mask(4,window=2)
expected=np.array([[1,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1]],dtype=bool)
assert np.array_equal(wm,expected),f"sliding window wrong:\n{wm}"
print("✓ repeat_kv correct")
print("✓ causal mask correct")
print("✓ sliding window mask correct")
print("\n+150 XP — GQA & Masks complete.")
