"""Learn action-conditioned dynamics, plan, and compare predictions to a simulator.

Known linear dynamics are the trusted simulator. Latents are observed states;
this is NOT an end-to-end pixel encoder or LeWorldModel/SIGReg reproduction.
"""
import json
import numpy as np


def world_experiment():
    rng=np.random.default_rng(18)
    true_a=np.array([[.9,.1],[0.,.95]]);true_b=np.array([[.5,0.],[.1,.4]])
    states=rng.normal(size=(300,2));actions=rng.uniform(-1,1,size=(300,2))
    next_states=states@true_a.T+actions@true_b.T
    noisy=next_states+rng.normal(size=next_states.shape)*.03
    design=np.column_stack([states,actions])
    fitted=np.linalg.lstsq(design[:240],noisy[:240],rcond=None)[0]
    learned_a,learned_b=fitted[:2].T,fitted[2:].T
    heldout=float(((design[240:]@fitted-next_states[240:])**2).mean())
    initial=np.array([-1.,-.5]);goal=np.array([1.,1.])
    candidates=rng.uniform(-1,1,size=(512,8,2))
    def costs(a,b,candidates,start):
        z=np.repeat(start[None,:],len(candidates),0);cost=np.zeros(len(candidates))
        for t in range(candidates.shape[1]):
            z=z@a.T+candidates[:,t]@b.T
            cost+=((z-goal)**2).sum(-1)+.02*(candidates[:,t]**2).sum(-1)
        return cost
    predicted=costs(learned_a,learned_b,candidates,initial)
    observed=costs(true_a,true_b,candidates,initial);choice=int(predicted.argmin())
    error_by_horizon=[]
    z_true,z_model=initial.copy(),initial.copy()
    for action in candidates[choice]:
        z_true=true_a@z_true+true_b@action;z_model=learned_a@z_model+learned_b@action
        error_by_horizon.append(float(((z_true-z_model)**2).mean()))
    # The replanning trace has a different budget; see the returned limitation.
    bad_b=learned_b*1.8
    state=initial.copy();closed=[]
    for _ in range(8):
        local=rng.uniform(-1,1,size=(128,4,2))
        chosen=int(costs(learned_a,bad_b,local,state).argmin())
        state=true_a@state+true_b@local[chosen,0];closed.append(state.tolist())
    # Conditional pixel-MSE mean for two distinct futures.
    futures=np.array([[1.,0.,0.],[0.,0.,1.]])
    return dict(seed=18,train_transitions=240,test_transitions=60,heldout_one_step_mse=heldout,
        learned_a=learned_a.tolist(),learned_b=learned_b.tolist(),selected_plan=choice,
        predicted_cost=float(predicted[choice]),simulator_cost=float(observed[choice]),
        multistep_mse=error_by_horizon,replanned_states=closed,ambiguous_pixel_mean=futures.mean(0).tolist(),
        limitation='Observed linear states, bounded sampled actions. Replanning uses extra observations and planning work; not a matched-cost superiority claim.')


if __name__=='__main__':
    print(json.dumps(world_experiment(),indent=2))
