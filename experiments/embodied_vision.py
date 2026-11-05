"""Original tiny images, convolution responses, and actual CPU classification."""
import json
import numpy as np
import torch
from torch import nn


def vision_experiment():
    torch.set_num_threads(1);torch.manual_seed(31)
    images=torch.randn(200,1,8,8)*.1;labels=torch.arange(200)%2
    for i,label in enumerate(labels):
        position=1+(i//2)%6
        if label==0:
            images[i,0,:,position]+=1
        else:
            images[i,0,position,:]+=1
    order=torch.randperm(200);train,test=order[:150],order[150:]
    model=nn.Sequential(nn.Conv2d(1,8,3),nn.ReLU(),nn.AdaptiveAvgPool2d(1),nn.Flatten(),nn.Linear(8,2))
    optimizer=torch.optim.Adam(model.parameters(),lr=.03)
    for _ in range(100):
        optimizer.zero_grad(set_to_none=True)
        loss=nn.functional.cross_entropy(model(images[train]),labels[train]);loss.backward();optimizer.step()
    with torch.no_grad():
        accuracy=float((model(images[test]).argmax(-1)==labels[test]).float().mean())
        response=model[0](images[:1])[0,0].numpy()
    patch_features=np.random.default_rng(31).normal(size=(16,8))
    patch_features[3]*=20
    return dict(seed=31,test_n=50,test_accuracy=accuracy,
        image=images[0,0].numpy().round(2).tolist(),conv_response=response.round(2).tolist(),
        injected_token_norm_grid=np.linalg.norm(patch_features,axis=1).reshape(4,4).round(2).tolist(),
        limitation='High norm was deliberately injected; not a measured pretrained-ViT artifact. Split is by synthetic sample, not new orientation family.')


if __name__=='__main__':
    print(json.dumps(vision_experiment(),indent=2))
