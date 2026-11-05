"""Train a conditional action velocity field and integrate it from noise."""
import json
import torch
from torch import nn


def flow_experiment():
    torch.set_num_threads(1);torch.manual_seed(53)
    context=torch.rand(256,1)*2-1
    actions=torch.cat([2*context,-context],1)
    network=nn.Sequential(nn.Linear(4,32),nn.Tanh(),nn.Linear(32,32),nn.Tanh(),nn.Linear(32,2))
    optimizer=torch.optim.Adam(network.parameters(),lr=.006)
    for _ in range(350):
        indices=torch.randint(192,(64,));c=context[indices];a=actions[indices]
        noise=torch.randn_like(a);time=torch.rand(len(a),1)
        interpolated=(1-time)*noise+time*a
        velocity=network(torch.cat([interpolated,time,c],1))
        loss=((velocity-(a-noise))**2).mean()
        optimizer.zero_grad(set_to_none=True);loss.backward();optimizer.step()
    with torch.no_grad():
        c=context[192:];x=torch.randn(len(c),2);initial=x.clone();steps=40
        for step in range(steps):
            time=torch.full((len(c),1),step/steps)
            x=x+network(torch.cat([x,time,c],1))/steps
        initial_mse=float(((initial-actions[192:])**2).mean())
        final_mse=float(((x-actions[192:])**2).mean())
    assert final_mse<initial_mse
    return dict(seed=53,training_updates=350,euler_steps=steps,heldout_n=64,initial_noise_mse=initial_mse,generated_action_mse=final_mse,
        limitation='Two synthetic action coordinates, no physical robot, safety, or pi0 benchmark claim.')


if __name__=='__main__':
    print(json.dumps(flow_experiment(),indent=2))
