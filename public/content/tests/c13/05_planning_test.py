import numpy as np
candidates = np.array([[[1.],[1.]],[[2.],[0.]],[[0.],[2.]]])
index,costs,states = plan_candidates(np.array([0.]),np.ones((1,1)),np.ones((1,1)),candidates,np.array([2.]))
assert index == 1 and np.allclose(costs,[1,0,4])
assert np.allclose(states[:,:,0],[[1,2],[2,2],[0,2]])
index,costs,_ = plan_candidates(np.array([0.]),np.ones((1,1)),np.ones((1,1)),candidates,np.array([2.]),2)
assert index == 0 and np.allclose(costs,[5,8,12])
for dtype in (np.int16,np.uint8):
    initial = np.array([0],dtype=dtype)
    a,b = np.zeros((1,1),dtype=dtype),np.ones((1,1),dtype=dtype)
    actions = np.array([[[200]],[[10]]],dtype=dtype)
    goal = np.array([0],dtype=dtype)
    inputs = (initial,a,b,actions,goal)
    originals = [value.copy() for value in inputs]
    index,costs,states = plan_candidates(*inputs)
    assert index == 1 and np.array_equal(costs,[40000.,100.]), 'Integer action costs must select action 10 over 200'
    assert np.array_equal(states,[[[200.]],[[10.]]])
    assert costs.dtype.kind == 'f' and states.dtype.kind == 'f'
    _,goal_costs,_ = plan_candidates(initial,a,b,actions,np.array([200],dtype=dtype))
    assert np.array_equal(goal_costs,[0.,36100.]), 'Unsigned goal subtraction must not wrap'
    assert all(np.array_equal(value,before) for value,before in zip(inputs,originals))
    initial = np.array([200,200],dtype=dtype)
    a,b = np.full((2,2),200,dtype=dtype),np.full((2,2),200,dtype=dtype)
    actions = np.array([[[200,200],[200,200]],[[10,10],[10,10]]],dtype=dtype)
    goal = np.array([200,200],dtype=dtype)
    inputs = (initial,a,b,actions,goal)
    originals = [value.copy() for value in inputs]
    index,costs,states = plan_candidates(*inputs,action_penalty=2.)
    expected_states = [[[160000.,160000.],[64080000.,64080000.]],[[84000.,84000.],[33604000.,33604000.]]]
    expected_costs = [2*(159800**2+64079800**2)+2*4*200**2,2*(83800**2+33603800**2)+2*4*10**2]
    assert index == 1 and np.allclose(states,expected_states) and np.allclose(costs,expected_costs), 'Rollout matrix products and action penalties must not overflow integer dtypes'
    assert all(np.array_equal(value,before) for value,before in zip(inputs,originals))
for dtype in (np.int64,np.uint64):
    actions = np.array([[[10**9]]*24,[[5*10**8]]*24],dtype=dtype)
    index,costs,_ = plan_candidates(np.zeros(1,dtype=dtype),np.zeros((1,1),dtype=dtype),np.ones((1,1),dtype=dtype),actions,np.zeros(1,dtype=dtype),3.)
    assert index == 1 and np.allclose(costs,[9.6e19,2.4e19]), 'Cost reductions must not overflow signed or unsigned integer accumulators'
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
