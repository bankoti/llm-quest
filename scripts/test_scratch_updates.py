"""Behavioral regressions for scratch pretraining's optimizer-update budget."""
import copy
from pathlib import Path
import sys
from unittest.mock import patch

import torch
from torch.nn import functional as F

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'experiments'))
import scratch_adaptation
import scratch_training


def check_budget(seed, updates, continuation=None):
    calls, snapshots, first_steps = {}, {}, {}
    original_step = torch.optim.AdamW.step

    def tracked_step(optimizer, *args, **kwargs):
        result = original_step(optimizer, *args, **kwargs)
        parameters = tuple(p for group in optimizer.param_groups for p in group['params'])
        owner = tuple(id(p) for p in parameters)
        calls[owner] = calls.get(owner, 0) + 1
        if calls[owner] == updates:
            snapshots[owner] = [p.detach().clone() for p in parameters]
        if calls[owner] == 1:
            first_steps[owner] = [p.detach().clone() for p in parameters]
        return result

    with patch.object(torch.optim.AdamW, 'step', tracked_step):
        model, report = scratch_training.scratch_pretrain(seed, updates)
    owner = tuple(id(p) for p in model.parameters())
    assert calls[owner] == updates, 'Resume verification must not update the returned model'
    assert all(torch.equal(p, expected) for p, expected in zip(model.parameters(), snapshots[owner]))
    assert sorted(calls.values()) == [1, 1, updates], 'Both continuation branches must update independent clones'
    assert report['updates'] == updates and report['resume_exact']
    if updates % 35 == 0:
        assert report['history'][-1]['update'] == updates
        assert report['final_validation_nll'] == report['history'][-1]['validation_nll']
    if continuation is not None:
        continuation.extend(first_steps[key] for key in calls if key != owner)

    expected = copy.deepcopy(model)
    with torch.no_grad():
        _, validation, test = scratch_training.scratch_data()
        for rows, key in ((validation, 'final_validation_nll'), (test, 'test_nll')):
            logits, _ = expected(rows[:, :-1])
            nll = float(F.cross_entropy(logits.flatten(0, 1), rows[:, 1:].flatten()))
            assert report[key] == nll
        torch.manual_seed(seed + 100)
        sample = expected.generate(torch.tensor([[0]]), 16, top_k=3).tolist()[0]
    assert report['generated_ids'] == sample
    return model, report


def main():
    continuation = []
    check_budget(seed=7, updates=35, continuation=continuation)
    next_model, _ = check_budget(seed=7, updates=36)
    assert len(continuation) == 2
    for branch in continuation:
        assert all(torch.equal(p, expected) for p, expected in zip(next_model.parameters(), branch)), 'Both resume branches must continue the training recipe'
    captured = []

    def tracked_pretrain(seed, updates):
        assert updates == 70
        result = check_budget(seed, updates)
        captured.append(result)
        return result

    with patch.object(scratch_adaptation, 'scratch_pretrain', tracked_pretrain):
        report = scratch_adaptation.adaptation_experiment(seed=11)
    assert len(captured) == 1
    assert report['pretraining_validation_nll'] == captured[0][1]['final_validation_nll']
    assert report['classification']['frozen_backbone']
    assert report['classification']['accuracy'] > report['classification']['baseline_accuracy']
    print('PASS scratch pretraining and adaptation update budgets')


if __name__ == '__main__':
    main()
