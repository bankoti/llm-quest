import numpy as np
logits=np.array([[2.,1.,.5],[.1,.9,.2]])
assert abs(distillation_loss(logits,logits))<1e-6,"identical->loss=0"
t=np.array([[3.,1.,0.]])
good=np.array([[2.8,1.1,.1]]); bad=np.array([[0.,0.,5.]])
assert distillation_loss(good,t)<distillation_loss(bad,t),"better student=lower loss"
assert distillation_loss(good,t)>=0
print("✓ identical->zero loss")
print("✓ better student has lower loss")
print("\n+200 XP — Distillation complete.")
