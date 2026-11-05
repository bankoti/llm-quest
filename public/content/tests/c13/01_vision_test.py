import numpy as np
image = np.arange(16.).reshape(4,4)
assert np.array_equal(patchify(image,2),[[0,1,4,5],[2,3,6,7],[8,9,12,13],[10,11,14,15]])
kernel = np.array([[1.,2.],[-1.,3.]])
expected = np.array([[image[i,j]+2*image[i,j+1]-image[i+1,j]+3*image[i+1,j+1] for j in range(3)] for i in range(3)])
assert np.allclose(conv_valid(image,kernel),expected), 'Do not flip the kernel'
assert np.allclose(conv_valid(image,np.ones((1,1))),image)
try:
    patchify(image,3)
except ValueError:
    pass
else:
    raise AssertionError('Reject partial patches')
print('Vision tensor checks passed.')
