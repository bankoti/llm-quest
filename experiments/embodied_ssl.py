"""Small Barlow-style view learning with a frozen held-out linear probe."""
import json
import torch
from torch import nn


def ssl_experiment():
    torch.set_num_threads(1);torch.manual_seed(23)
    latent=torch.randn(256,3);mix=torch.randn(3,8);observations=latent@mix
    encoder=nn.Sequential(nn.Linear(8,16),nn.ReLU(),nn.Linear(16,3))
    optimizer=torch.optim.Adam(encoder.parameters(),lr=.005)
    history=[]
    for step in range(180):
        first=encoder(observations[:192]+torch.randn(192,8)*.1)
        second=encoder(observations[:192]+torch.randn(192,8)*.1)
        a=(first-first.mean(0))/torch.sqrt(first.var(0,unbiased=False)+1e-5)
        b=(second-second.mean(0))/torch.sqrt(second.var(0,unbiased=False)+1e-5)
        c=a.T@b/len(a)
        diagonal=torch.eye(3,dtype=torch.bool)
        loss=((1-c.diag())**2).sum()+.05*(c[~diagonal]**2).sum()
        optimizer.zero_grad(set_to_none=True);loss.backward();optimizer.step()
        if step%60==0 or step==179:
            history.append(dict(step=step+1,loss=float(loss.detach()),feature_std=first.detach().std(0).tolist()))
    with torch.no_grad():
        features=encoder(observations)
        weights=torch.linalg.lstsq(features[:192],latent[:192]).solution
        probe_mse=float(((features[192:]@weights-latent[192:])**2).mean())
        constant_mse=float(((latent[:192].mean(0)-latent[192:])**2).mean())
    assert torch.isfinite(features).all() and features.std(0).min()>.01
    return dict(seed=23,history=history,heldout_probe_mse=probe_mse,constant_baseline_mse=constant_mse,
        collapsed_barlow_diagonal_penalty=3.,limitation='Synthetic vector views, not DINO or a full image benchmark.')


if __name__=='__main__':
    print(json.dumps(ssl_experiment(),indent=2))
