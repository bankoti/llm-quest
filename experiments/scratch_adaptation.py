"""Actual classification, response-only SFT, and low-rank adaptation on CPU.

Run: uv run --with numpy --with torch python experiments/scratch_adaptation.py
The notebook embeds scratch_training and the vendor model; local imports reuse it.
"""
import copy
import json
import torch
from torch import nn
from torch.nn import functional as F

if 'scratch_pretrain' not in globals():
    from scratch_training import scratch_pretrain, scratch_data


def adaptation_experiment(seed=11):
    model, pretraining = scratch_pretrain(seed, 70)
    train, validation, test = scratch_data()
    for parameter in model.parameters():
        parameter.requires_grad_(False)
    frozen = copy.deepcopy(model.state_dict())

    def features(rows):
        # Use the pretrained decoder's representation, not a new feature model.
        with torch.no_grad():
            ids = rows[:, :-1]
            x = model.token_embedding(ids) + model.position_embedding(torch.arange(ids.shape[1]))
            for block in model.blocks:
                x = block(x)
            return model.final_norm(x)[:, -1]

    model.eval()
    train_x, test_x = features(train), features(test)
    train_y, test_y = (train[:, -2] >= 4).long(), (test[:, -2] >= 4).long()
    head = nn.Linear(train_x.shape[1], 2)
    optimizer = torch.optim.AdamW(head.parameters(), lr=.04)
    for _ in range(100):
        optimizer.zero_grad(set_to_none=True)
        loss = F.cross_entropy(head(train_x), train_y); loss.backward(); optimizer.step()
    predictions = head(test_x).argmax(-1)
    accuracy = float((predictions == test_y).float().mean())
    baseline = float((test_y == train_y.bincount(minlength=2).argmax()).float().mean())
    f1s = []
    for label in (0, 1):
        tp = int(((predictions == label) & (test_y == label)).sum())
        fp = int(((predictions == label) & (test_y != label)).sum())
        fn = int(((predictions != label) & (test_y == label)).sum())
        f1s.append(2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0.)
    assert all(torch.equal(frozen[k], model.state_dict()[k]) for k in frozen)
    assert accuracy > baseline

    # Adapt the pretrained model on a tiny instruction-conditioned task.
    # Templates 0/1 mean copy/successor; nuisance token is split by value.
    # Prompt=[template, nuisance, number]; response=[answer, EOS=7].
    # Numbers 0..3 avoid collision with EOS. Nuisance 4/5 train, 6 holdout.
    adapted = copy.deepcopy(model)
    for p in adapted.parameters():
        p.requires_grad_(True)
    def instruction_rows(nuisances):
        rows = []
        for mode in (0, 1):
            for nuisance in nuisances:
                for number in range(4):
                    rows.append([mode, nuisance, number, (number+mode) % 4, 7])
        return torch.tensor(rows)
    sft_train, sft_test = instruction_rows([4, 5]), instruction_rows([6])
    opt = torch.optim.AdamW(adapted.parameters(), lr=.004)
    def response_loss(rows):
        logits, _ = adapted(rows[:, :-1])
        return F.cross_entropy(logits[:, 2:].reshape(-1, 8), rows[:, 3:].reshape(-1))
    with torch.no_grad():
        initial_sft = float(response_loss(sft_test))
    for _ in range(200):
        opt.zero_grad(set_to_none=True)
        loss = response_loss(sft_train); loss.backward(); opt.step()
    with torch.no_grad():
        final_sft = float(response_loss(sft_test))
        generated = sft_test[:, :3].clone()
        for _ in range(2):
            logits, _ = adapted(generated)
            generated = torch.cat([generated, logits[:, -1].argmax(-1, keepdim=True)], -1)
        exact = float((generated[:, 3:] == sft_test[:, 3:]).all(-1).float().mean())
    assert final_sft < initial_sft

    # Isolated LoRA mechanism: the target differs from a frozen base by rank 2.
    torch.manual_seed(seed)
    x = torch.randn(160, 8)
    base = torch.randn(8, 6)
    base_before = base.clone()
    target = base + torch.randn(8, 2) @ torch.randn(2, 6)
    y = x @ target
    a, b = nn.Parameter(torch.randn(8, 2)*.1), nn.Parameter(torch.zeros(2, 6))
    opt = torch.optim.Adam([a, b], lr=.06)
    initial_lora = float(F.mse_loss(x[120:] @ base, y[120:]))
    for _ in range(250):
        opt.zero_grad(set_to_none=True)
        loss = F.mse_loss(x[:120] @ base + (x[:120] @ a) @ b, y[:120]); loss.backward(); opt.step()
    with torch.no_grad():
        direct = x[120:] @ base + (x[120:] @ a) @ b
        merged = x[120:] @ (base + a @ b)
        merge_error = float((direct-merged).abs().max())
        final_lora = float(F.mse_loss(direct, y[120:]))
    assert torch.equal(base, base_before) and merge_error < 1e-4 and final_lora < initial_lora
    return dict(seed=seed, pretraining_validation_nll=pretraining['final_validation_nll'],
        classification=dict(test_n=len(test), baseline_accuracy=baseline, accuracy=accuracy, macro_f1=sum(f1s)/2, frozen_backbone=True),
        sft=dict(train_n=len(sft_train), test_n=len(sft_test), initial_nll=initial_sft, final_nll=final_sft, exact_match=exact),
        lora=dict(initial_mse=initial_lora, final_mse=final_lora, merge_max_error=merge_error, frozen_base=True),
        limitation='Synthetic tasks test mechanisms. Held-out nuisance values are not evidence of broad instruction generalization.')


if __name__ == '__main__':
    print(json.dumps(adaptation_experiment(), indent=2))
