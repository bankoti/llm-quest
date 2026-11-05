import numpy as np
p, q, n = np.array([.8,.2]), np.array([-.5,.9]), np.array([20,1])
assert puct_select(p,q,n,1) == 1
assert puct_select(np.array([.5,.5]),np.zeros(2),np.zeros(2)) == 0
for dtype,count,values,expected in [(np.uint8,255,[0.,0.],1),(np.int8,127,[np.sqrt(128)/2,0.],0)]:
    priors,values,visits = np.array([.5,.5]),np.array(values),np.array([count,0],dtype=dtype)
    inputs = (priors,values,visits)
    originals = [value.copy() for value in inputs]
    assert puct_select(*inputs) == expected, 'Visit denominators must not wrap at integer dtype limits'
    assert all(np.array_equal(value,before) for value,before in zip(inputs,originals))
assert puct_select(np.array([.1,.9]),np.zeros(2),np.array([2**62,2**62],dtype=np.int64)) == 1, 'Visit totals must not overflow integer accumulators'
assert backup_values(.7,3) == [-.7,.7,-.7,.7]
assert backup_values(.7,3,False) == [.7]*4
print('Policy/value/search checks passed.')
