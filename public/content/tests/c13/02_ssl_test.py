import numpy as np
loss,c = barlow_loss(np.ones((4,3)),np.ones((4,3)))
assert loss == 3 and np.allclose(c,0), 'Collapsed views must not receive zero loss'
x = np.array([[-1.,-1.],[-1.,1.],[1.,-1.],[1.,1.]])
loss,c = barlow_loss(x,x,epsilon=1e-12)
assert loss < 1e-20 and np.allclose(c,np.eye(2))
duplicate = x[:,[0,0]]
loss,_ = barlow_loss(duplicate,duplicate,redundancy=.1,epsilon=1e-12)
assert np.isclose(loss,.2)
offset = 3*2**53
view_a = np.array([[offset],[offset-8]],float)
view_b = view_a[::-1].copy()
originals = [value.copy() for value in (view_a,view_b)]
expected_correlation = -16./(16.+1e-5)
loss,c = barlow_loss(view_a,view_b)
assert np.isclose(c[0,0],expected_correlation,rtol=1e-14,atol=0), 'Keep representable small differences under a huge common offset'
assert np.isclose(loss,(1-expected_correlation)**2,rtol=1e-14,atol=0)
assert all(np.array_equal(value,before) for value,before in zip((view_a,view_b),originals))
base = np.array([[0.],[-8.]])
base_loss,base_c = barlow_loss(base,base[::-1])
for common_offset in (offset,-offset):
    shifted = base+common_offset
    shifted_loss,shifted_c = barlow_loss(shifted,shifted[::-1])
    assert np.allclose(shifted_c,base_c,rtol=1e-14,atol=0) and np.isclose(shifted_loss,base_loss,rtol=1e-14,atol=0), 'Standardization must retain offset invariance when differences are representable'
maximum = np.finfo(float).max
mixed = np.array([[offset,maximum],[offset-8,-maximum]])
before = mixed.copy()
factors = np.array([4./np.hypot(4.,np.sqrt(1e-5)),1.])
expected_c = -np.outer(factors,factors)
expected_loss = ((1-np.diag(expected_c))**2).sum()+.005*(expected_c[0,1]**2+expected_c[1,0]**2)
with np.errstate(over='raise',invalid='raise'):
    loss,c = barlow_loss(mixed,mixed[::-1])
assert np.allclose(c,expected_c,rtol=1e-14,atol=0) and np.isclose(loss,expected_loss,rtol=1e-14,atol=0), 'Fallback only for columns whose reference centering overflows'
assert np.array_equal(mixed,before)
for extreme in (np.array([[-8e307],[8e307],[8e307]]),np.array([[0.],[-1.7e308],[1.7e308],[1.7e308]])):
    before = extreme.copy()
    with np.errstate(over='raise',invalid='raise'):
        loss,c = barlow_loss(extreme,extreme)
    assert np.allclose(c,[[1.]],rtol=1e-14,atol=0) and loss < 1e-26, 'Fallback must handle overflowing shifted means or centered deviations'
    assert np.array_equal(extreme,before)
huge = x*1e200
before = huge.copy()
loss,c = barlow_loss(huge,huge,epsilon=1e-12)
assert loss < 1e-20 and np.allclose(c,np.eye(2)), 'Finite huge variances must retain standardized correlation'
assert np.array_equal(huge,before)
for epsilon in (1e-5,np.nextafter(0.,1.)):
    collapsed = np.full((4,3),1e308)
    before = collapsed.copy()
    loss,c = barlow_loss(collapsed,collapsed,epsilon=epsilon)
    assert loss == 3. and np.array_equal(c,np.zeros((3,3))), 'Constant huge columns must remain finite collapsed views'
    assert np.array_equal(collapsed,before)
for magnitude,epsilon in ((1e-160,1e-320),(1e-100,1e-205),(1.,1e-5),(1e100,1e190)):
    view = x*magnitude
    before = view.copy()
    expected = 1./(1.+(np.sqrt(epsilon)/magnitude)**2)
    loss,c = barlow_loss(view,view,epsilon=epsilon)
    assert np.allclose(c,np.eye(2)*expected,rtol=1e-12,atol=8*np.finfo(float).eps), 'Column scaling must preserve the additive epsilon convention'
    assert np.isclose(loss,2*(1-expected)**2,rtol=1e-5,atol=1e-30)
    assert np.array_equal(view,before)
features = np.array([[1.,0.],[0.,1.],[1.,1.]])
assert gram_distance(features,features*3) < 1e-20
assert gram_distance(features,features[[0,2,1]]) > .01
for magnitude in (1e200,1e-200,np.finfo(float).max,np.nextafter(0.,1.)):
    features = np.array([[magnitude,0.],[0.,magnitude]])
    anchor = np.array([[magnitude,0.],[magnitude,0.]])
    originals = [value.copy() for value in (features,anchor)]
    assert gram_distance(features,anchor) == .5, 'Cosine Gram distance must survive huge and tiny finite row scales'
    assert all(np.array_equal(value,before) for value,before in zip((features,anchor),originals))
features = np.array([[1e200,1e-200],[1e-200,1e200]])
anchor = np.array([[1e-200,0.,0.],[1e200,0.,0.]])
originals = [value.copy() for value in (features,anchor)]
assert gram_distance(features,anchor) == .5, 'Normalize rows independently while allowing differing feature widths'
assert all(np.array_equal(value,before) for value,before in zip((features,anchor),originals))
for dtype,magnitude in ((np.int16,200),(np.int64,2**62),(np.uint64,2**63)):
    features = np.array([[magnitude,0],[0,magnitude]],dtype=dtype)
    anchor = np.array([[magnitude,0],[magnitude,0]],dtype=dtype)
    originals = [value.copy() for value in (features,anchor)]
    assert gram_distance(features,anchor) == .5, 'Convert signed and unsigned feature inputs before normalization'
    assert all(np.array_equal(value,before) for value,before in zip((features,anchor),originals))
print('SSL objective checks passed.')
