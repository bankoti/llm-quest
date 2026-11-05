import numpy as np
p, q, n = np.array([.8,.2]), np.array([-.5,.9]), np.array([20,1])
assert puct_select(p,q,n,1) == 1
assert puct_select(np.array([.5,.5]),np.zeros(2),np.zeros(2)) == 0
assert backup_values(.7,3) == [-.7,.7,-.7,.7]
assert backup_values(.7,3,False) == [.7]*4
print('Policy/value/search checks passed.')
