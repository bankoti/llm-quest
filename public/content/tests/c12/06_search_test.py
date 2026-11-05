import numpy as np
p, q, n = np.array([.8,.2]), np.array([-.5,.9]), np.array([20,1])
assert puct_select(p,q,n,1) == 1
assert puct_select(np.array([.5,.5]),np.zeros(2),np.zeros(2)) == 0
for counts,expected in (([100.,10.],1),([10.,10.],0)):
    priors,values,visits = np.array([.5,.5]),np.zeros(2),np.array(counts)
    inputs = (priors,values,visits)
    originals = [value.copy() for value in inputs]
    with np.errstate(over='raise',invalid='raise'):
        selected = puct_select(*inputs,exploration=1e308)
    assert selected == expected, 'Finite large exploration bonuses must preserve ranking and first-tie selection'
    assert all(np.array_equal(value,before) for value,before in zip(inputs,originals))
maximum = np.finfo(float).max
for priors,values,visits in (
    (np.array([.5,.5]),np.array([maximum,0.]),np.zeros(2)),
    (np.array([1.,0.]),np.zeros(2),np.array([0.,100.])),
):
    inputs = (priors,values,visits)
    originals = [value.copy() for value in inputs]
    with np.errstate(over='ignore',invalid='ignore'):
        try:
            puct_select(*inputs,exploration=maximum)
        except FloatingPointError:
            pass
        else:
            raise AssertionError('Nonfinite exploration bonuses or final scores must fail before selection')
    assert all(np.array_equal(value,before) for value,before in zip(inputs,originals))
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
