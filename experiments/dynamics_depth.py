"""Measured plain/residual depth sweeps. CPU; three seeds; no promised winner."""
import json
import torch
from torch import nn


def depth_experiment():
    torch.set_num_threads(1)
    reports = []
    for seed in [2, 5, 11]:
        for depth in [2, 8, 16]:
            for residual in [False, True]:
                torch.manual_seed(seed)
                x = torch.randn(160, 8); y = .5*x + .2*torch.sin(x)
                layers = nn.ModuleList([nn.Linear(8, 8, bias=False) for _ in range(depth)])
                for layer in layers:
                    nn.init.normal_(layer.weight, std=.08)
                def forward(inputs):
                    state = inputs
                    for layer in layers:
                        update = torch.tanh(layer(state))
                        state = state + update if residual else update
                    return state
                optimizer = torch.optim.Adam(layers.parameters(), lr=.01)
                initial = float(((forward(x[:120])-y[:120])**2).mean().detach())
                initial_gradients = None
                for step in range(100):
                    optimizer.zero_grad(set_to_none=True)
                    loss = ((forward(x[:120])-y[:120])**2).mean(); loss.backward()
                    if step == 0:
                        initial_gradients = [float(layer.weight.grad.norm()) for layer in layers]
                    optimizer.step()
                with torch.no_grad():
                    train = float(((forward(x[:120])-y[:120])**2).mean())
                    test = float(((forward(x[120:])-y[120:])**2).mean())
                    center = layers[0].weight.clone()
                    direction = torch.randn_like(center); direction /= direction.norm()
                    sweep = []
                    for offset in [-1., -.5, 0., .5, 1.]:
                        layers[0].weight.copy_(center + offset*direction)
                        sweep.append(float(((forward(x[:120])-y[:120])**2).mean()))
                    layers[0].weight.copy_(center)
                reports.append(dict(seed=seed, depth=depth, residual=residual, parameters=depth*64,
                    initial_train_mse=initial, train_mse=train, test_mse=test, initial_layer_gradient_norms=initial_gradients,
                    first_layer_unit_direction_offsets=[-1, -.5, 0, .5, 1], slice_mse=sweep))
    return reports


if __name__ == '__main__':
    print(json.dumps(depth_experiment(), indent=2))
    print('Target is near identity; this favors residual structure. Equal width is not equal compute.')
