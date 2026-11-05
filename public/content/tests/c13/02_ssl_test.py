import numpy as np
loss,c = barlow_loss(np.ones((4,3)),np.ones((4,3)))
assert loss == 3 and np.allclose(c,0), 'Collapsed views must not receive zero loss'
x = np.array([[-1.,-1.],[-1.,1.],[1.,-1.],[1.,1.]])
loss,c = barlow_loss(x,x,epsilon=1e-12)
assert loss < 1e-20 and np.allclose(c,np.eye(2))
duplicate = x[:,[0,0]]
loss,_ = barlow_loss(duplicate,duplicate,redundancy=.1,epsilon=1e-12)
assert np.isclose(loss,.2)
features = np.array([[1.,0.],[0.,1.],[1.,1.]])
assert gram_distance(features,features*3) < 1e-20
assert gram_distance(features,features[[0,2,1]]) > .01
print('SSL objective checks passed.')
