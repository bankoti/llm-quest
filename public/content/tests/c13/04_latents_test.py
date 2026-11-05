import numpy as np
p = np.array([[[1.,3.],[100.,100.]],[[2.,4.],[5.,7.]]])
t = np.zeros_like(p);m = np.array([[1,0],[0,1]],bool)
assert latent_mse(p,t,m) == (1+9+25+49)/4
for dtype in (np.int16,np.uint8):
    assert latent_mse(np.array([[[200]]],dtype=dtype),np.array([[[0]]],dtype=dtype),np.array([[True]])) == 40000.
    prediction = np.array([[[200,0],[100,100]]],dtype=dtype)
    target = np.array([[[0,200],[0,0]]],dtype=dtype)
    selected = np.array([[True,False]])
    originals = [value.copy() for value in (prediction,target,selected)]
    assert latent_mse(prediction,target,selected) == 40000., 'Integer differences and squares must use floating arithmetic'
    assert all(np.array_equal(value,before) for value,before in zip((prediction,target,selected),originals))
a,b = np.array([2.,4.]),np.array([6.,0.])
result = ema_target(a,b,.9)
assert np.allclose(result,[2.4,3.6])
result[:] = 0
assert np.array_equal(a,[2,4]) and np.array_equal(b,[6,0])
for prediction,target,selected in [(p,t,np.zeros_like(m)),(p,t[:1],m),
                                    (p,t,m.astype(int)),(p+np.inf,t,m)]:
    try:
        latent_mse(prediction,target,selected)
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid latent targets, shapes, and masks')
print('Latent prediction checks passed.')
