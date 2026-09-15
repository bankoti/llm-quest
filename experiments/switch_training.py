"""Autograd gate check and a tiny learned router with capacity constraints.

CPU: uv run --with torch python experiments/switch_training.py
"""
import json
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.set_num_threads(1)

class SwitchLayer(nn.Module):
    def __init__(self):
        super().__init__()
        self.router = nn.Linear(4, 4)
        self.experts = nn.ModuleList([nn.Linear(4, 4, bias=False) for _ in range(4)])
        with torch.no_grad():
            self.router.bias.copy_(torch.tensor([2., 0., 0., 0.]))

    def forward(self, x, factor=1.0):
        p = self.router(x).float().softmax(-1)
        chosen = p.argmax(-1)
        output = torch.zeros_like(x)
        accepted = torch.zeros(len(x), dtype=torch.bool)
        capacity = math.ceil(factor * len(x) / len(self.experts))
        for i, expert in enumerate(self.experts):
            idx = torch.where(chosen == i)[0][:capacity]
            if len(idx):
                output = output.index_add(0, idx, expert(x[idx]) * p[idx, i, None])
                accepted[idx] = True
        f = F.one_hot(chosen, len(self.experts)).float().mean(0)
        auxiliary = len(self.experts) * (f * p.mean(0)).sum()
        return output, auxiliary, chosen, accepted

def gate_gradient_check():
    logits = torch.tensor([[2., 1., 0.]], requires_grad=True)
    gate = logits.softmax(-1).max(-1).values
    correct = torch.autograd.grad((gate * 3).sum(), logits, retain_graph=True)[0]
    incorrect = torch.autograd.grad(((gate / gate) * 3).sum(), logits)[0]
    assert correct.abs().sum() > 0
    torch.testing.assert_close(incorrect, torch.zeros_like(incorrect))
    return {'retained_gate_gradient': correct.tolist(), 'renormalized_gate_gradient': incorrect.tolist()}

def train_router():
    rows = []
    for coefficient in [0., .1, 1.]:
        torch.manual_seed(71)
        x = torch.randn(32, 4)
        target = x.tanh()
        model = SwitchLayer()
        optimizer = torch.optim.Adam(model.parameters(), lr=.02)
        for step in range(100):
            output, auxiliary, choices, accepted = model(x)
            task = F.mse_loss(output, target)
            optimizer.zero_grad()
            (task + coefficient * auxiliary).backward()
            optimizer.step()
        with torch.no_grad():
            output, auxiliary, choices, accepted = model(x)
            rows.append({'coefficient': coefficient, 'task_loss': F.mse_loss(output,target).item(),
                         'auxiliary': auxiliary.item(), 'loads': torch.bincount(choices,minlength=4).tolist(),
                         'dropped': int((~accepted).sum())})
    return rows

if __name__ == '__main__':
    print(json.dumps(gate_gradient_check(), indent=2))
    print(json.dumps(train_router(), indent=2))
    print('One synthetic batch and seed, not a quality benchmark. Compare load, overflow, and task loss; balancing is not a guaranteed improvement.')
