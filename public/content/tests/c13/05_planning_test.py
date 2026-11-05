import numpy as np
candidates = np.array([[[1.],[1.]],[[2.],[0.]],[[0.],[2.]]])
index,costs,states = plan_candidates(np.array([0.]),np.ones((1,1)),np.ones((1,1)),candidates,np.array([2.]))
assert index == 1 and np.allclose(costs,[1,0,4])
assert np.allclose(states[:,:,0],[[1,2],[2,2],[0,2]])
index,costs,_ = plan_candidates(np.array([0.]),np.ones((1,1)),np.ones((1,1)),candidates,np.array([2.]),2)
assert index == 0 and np.allclose(costs,[5,8,12])
rng = np.random.default_rng(1)
a,b = rng.normal(size=(2,2)),rng.normal(size=(2,3));c=rng.normal(size=(4,3,3));z=np.array([1.,-1.]);goal=np.array([.5,.2])
_,costs,rollouts = plan_candidates(z,a,b,c,goal,.1)
for i in range(4):
    state=z.copy();cost=0
    for t in range(3):
        state=a@state+b@c[i,t];cost+=sum((state-goal)**2)+.1*sum(c[i,t]**2)
        assert np.allclose(state,rollouts[i,t])
    assert np.isclose(cost,costs[i])
print('World-model planning checks passed.')
