import numpy as np
np.random.seed(1)
x=np.random.randn(2,5,8)+3.0
w=np.random.rand(8)+0.5
def _ref(x,w,eps=1e-6):
    return w*x/np.sqrt((x**2).mean(axis=-1,keepdims=True)+eps)
got=rms_norm(x,w)
assert np.allclose(got,_ref(x,w),atol=1e-8), "This is LayerNorm-without-bias, not RMSNorm. What does RMSNorm deliberately NOT do to x before scaling?"
print("✓ RMSNorm matches the paper: scale by root-mean-square, never center")
print("\n+150 XP — The Norm That Centers debugged.")
