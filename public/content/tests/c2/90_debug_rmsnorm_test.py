import numpy as np
np.random.seed(1)
x=np.random.randn(2,5,8)+3.0
w=np.random.rand(8)+0.5

def _ref(x,w,eps=1e-6):
    return w*x/np.sqrt((x**2).mean(axis=-1,keepdims=True)+eps)

got=rms_norm(x,w)

# 1. Correct values: must match the RMS normalization formula
assert np.allclose(got,_ref(x,w),atol=1e-8), "Output values do not match expected normalization"

# 2. The mean of x should NOT be subtracted (RMSNorm != LayerNorm)
x_shifted = x + 10.0  # large mean shift
got_shifted = rms_norm(x_shifted, w)
ref_shifted = _ref(x_shifted, w)
assert np.allclose(got_shifted, ref_shifted, atol=1e-8), "Result changes incorrectly when input mean shifts — centering is not part of this norm"

# 3. Output shape preserved
assert got.shape == x.shape, f"Expected shape {x.shape}, got {got.shape}"

# 4. Scale weight is applied element-wise
w_ones = np.ones(8)
got_unscaled = rms_norm(x, w_ones)
rms = np.sqrt((x**2).mean(axis=-1, keepdims=True) + 1e-6)
assert np.allclose(got_unscaled, x / rms, atol=1e-8), "With unit weights, output should equal x divided by its RMS"

print("✓ RMSNorm matches the paper: scale by root-mean-square, never center")
print("\n+150 XP — The Norm That Centers debugged.")
