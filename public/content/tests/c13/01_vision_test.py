import numpy as np
image = np.arange(16.).reshape(4,4)
assert np.array_equal(patchify(image,2),[[0,1,4,5],[2,3,6,7],[8,9,12,13],[10,11,14,15]])
kernel = np.array([[1.,2.],[-1.,3.]])
expected = np.array([[image[i,j]+2*image[i,j+1]-image[i+1,j]+3*image[i+1,j+1] for j in range(3)] for i in range(3)])
assert np.allclose(conv_valid(image,kernel),expected), 'Do not flip the kernel'
assert np.allclose(conv_valid(image,np.ones((1,1))),image)
for integer_image, integer_kernel, expected in [
    (np.array([[255]], dtype=np.uint8), np.array([[2]], dtype=np.uint8), [[510.]]),
    (np.array([[-100]], dtype=np.int8), np.array([[2]], dtype=np.int8), [[-200.]]),
    (np.array([[100, 100]], dtype=np.int8), np.array([[2, -1]], dtype=np.int8), [[100.]]),
]:
    before_image, before_kernel = integer_image.copy(), integer_kernel.copy()
    result = conv_valid(integer_image, integer_kernel)
    assert np.array_equal(result, expected), 'Promote integer operands before products and signed cancellation'
    assert result.dtype.kind == 'f'
    assert np.array_equal(integer_image, before_image) and np.array_equal(integer_kernel, before_kernel)
try:
    patchify(image,3)
except ValueError:
    pass
else:
    raise AssertionError('Reject partial patches')
print('Vision tensor checks passed.')
