"""Actual modular training, frozen probes, and frequency interventions.

Default 300 updates is a smoke run, NOT a promised grokking reproduction.
To investigate longer: MODULAR_STEPS=20000 python experiments/dynamics_modular.py
Reports all seeds; no external data. This MLP differs from the paper Transformer.
"""
import json
import os
import numpy as np
import torch
from torch import nn
from torch.nn import functional as F


def modular_experiment(steps=300):
    torch.set_num_threads(1)
    modulus = 17
    pairs = torch.cartesian_prod(torch.arange(modulus), torch.arange(modulus))
    inputs = torch.cat([F.one_hot(pairs[:, 0], modulus), F.one_hot(pairs[:, 1], modulus)], -1).float()
    targets = pairs.sum(-1) % modulus
    split = torch.randperm(len(pairs), generator=torch.Generator().manual_seed(44))
    train, test = split[:100], split[100:]
    reports = []
    for seed in [3, 8, 21]:
        torch.manual_seed(seed)
        hidden = nn.Sequential(nn.Linear(2*modulus, 64), nn.ReLU())
        head = nn.Linear(64, modulus)
        model = nn.Sequential(hidden, head)
        optimizer = torch.optim.AdamW(model.parameters(), lr=.003, weight_decay=.1)
        curve = []
        for step in range(steps):
            optimizer.zero_grad(set_to_none=True)
            loss = F.cross_entropy(model(inputs[train]), targets[train]); loss.backward(); optimizer.step()
            if step % max(1, steps//10) == 0 or step == steps-1:
                with torch.no_grad():
                    logits = model(inputs)
                    curve.append(dict(step=step+1, train_accuracy=float((logits[train].argmax(-1)==targets[train]).float().mean()), test_accuracy=float((logits[test].argmax(-1)==targets[test]).float().mean())))
        with torch.no_grad():
            features = hidden(inputs).numpy()
            logits = model(inputs).numpy().astype(np.float64).reshape(modulus, modulus, modulus)
        onehot = np.eye(modulus)[targets.numpy()]
        h = features[train]; y = onehot[train]
        weights = np.linalg.solve(h.T@h + np.eye(64), h.T@y)
        probe_accuracy = float((features[test]@weights).argmax(-1).__eq__(targets[test].numpy()).mean())
        shuffled = np.random.default_rng(seed).permutation(y)
        shuffled_weights = np.linalg.solve(h.T@h + np.eye(64), h.T@shuffled)
        shuffled_accuracy = float(((features[test]@shuffled_weights).argmax(-1)==targets[test].numpy()).mean())
        spectrum = np.fft.fft2(logits, axes=(0, 1))
        energy = np.abs(spectrum).sum(-1)**2
        # Predeclared illustrative diagonal frequencies, not a discovered circuit.
        mask = np.eye(modulus, dtype=bool)
        restricted = np.fft.ifft2(np.where(mask[..., None], spectrum, 0), axes=(0, 1)).real
        excluded = logits - restricted
        def heldout_loss(values):
            return float(F.cross_entropy(torch.tensor(values.reshape(-1, modulus)[test]), targets[test]))
        assert np.allclose(restricted+excluded, logits)
        reports.append(dict(seed=seed, steps=steps, train_pairs=len(train), test_pairs=len(test), curve=curve,
            probe_accuracy=probe_accuracy, shuffled_probe_accuracy=shuffled_accuracy,
            total_loss=heldout_loss(logits), restricted_loss=heldout_loss(restricted), excluded_loss=heldout_loss(excluded),
            diagonal_frequency_energy_fraction=float(energy[mask].sum()/energy.sum()),
            neuron0_grid=features[:, 0].reshape(modulus, modulus).round(3).tolist(),
            delayed_transition_observed=any(p['train_accuracy']>.95 and p['test_accuracy']<.3 for p in curve[:-1]) and curve[-1]['test_accuracy']>.9))
    return reports


if __name__ == '__main__':
    print(json.dumps(modular_experiment(int(os.environ.get('MODULAR_STEPS', '300'))), indent=2))
