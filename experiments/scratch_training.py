"""CPU pretraining, token-weighted accumulation, and exact local resume.

Run: uv run --with numpy --with torch python experiments/scratch_training.py
The notebook embeds the existing mini_llm model source before this cell.
No downloaded data/weights. Fixed synthetic language, not natural-language skill.
"""
import copy
import hashlib
import io
import json
from pathlib import Path
import sys
import torch
from torch.nn import functional as F

if 'GPT' not in globals():
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'colab/vendor/src'))
    from mini_llm.models import GPT
    from mini_llm.config import ModelConfig


def scratch_data(seed=19):
    """Independent unique sequences: next symbol usually advances by one."""
    generator = torch.Generator().manual_seed(seed)
    rows, seen = [], set()
    while len(rows) < 320:
        row = [int(torch.randint(8, (1,), generator=generator))]
        for _ in range(12):
            step = 1 if torch.rand((), generator=generator) < .82 else 3
            row.append((row[-1] + step) % 8)
        if tuple(row) not in seen:
            seen.add(tuple(row)); rows.append(row)
    data = torch.tensor(rows)
    permutation = torch.randperm(len(data), generator=generator)
    data = data[permutation]
    return data[:224], data[224:272], data[272:]


def scratch_pretrain(seed=7, updates=140):
    torch.set_num_threads(1)
    torch.manual_seed(seed)
    config = ModelConfig(vocab_size=8, block_size=12, n_layer=1, n_head=2, n_embd=24, dropout=0.)
    model = GPT(config)
    optimizer = torch.optim.AdamW(model.parameters(), lr=.006, weight_decay=.01)
    train, validation, test = scratch_data()
    generator = torch.Generator().manual_seed(seed + 1)

    def evaluate(rows):
        model.eval()
        with torch.no_grad():
            logits, _ = model(rows[:, :-1])
            return float(F.cross_entropy(logits.flatten(0, 1), rows[:, 1:].flatten()))

    initial = evaluate(validation)
    history = []
    for step in range(updates):
        model.train()
        indices = torch.randint(len(train), (24,), generator=generator)
        batch = train[indices]
        optimizer.zero_grad(set_to_none=True)
        # Unequal microbatch sizes still implement the full token-average gradient.
        tokens = batch[:, 1:].numel()
        for micro in (batch[:7], batch[7:]):
            logits, _ = model(micro[:, :-1])
            loss_sum = F.cross_entropy(logits.flatten(0, 1), micro[:, 1:].flatten(), reduction='sum')
            (loss_sum / tokens).backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.)
        optimizer.step()
        if (step + 1) % 35 == 0:
            history.append({'update': step + 1, 'train_nll': evaluate(train), 'validation_nll': evaluate(validation)})

    # Snapshot immediately before the next sampled update, including RNG state.
    checkpoint = copy.deepcopy(dict(model=model.state_dict(), optimizer=optimizer.state_dict(),
        rng=generator.get_state(), torch_rng=torch.get_rng_state(), step=updates, cursor=0,
        config=config.to_dict(), tokenizer_id='symbols-a-through-h-v1'))
    serialized = io.BytesIO()
    torch.save(checkpoint, serialized)
    serialized.seek(0)
    checkpoint = torch.load(serialized, weights_only=True)

    def next_update(m, opt, gen):
        m.train()
        batch = train[torch.randint(len(train), (24,), generator=gen)]
        opt.zero_grad(set_to_none=True)
        _, loss = m(batch[:, :-1], batch[:, 1:])
        loss.backward(); opt.step()
        return float(loss.detach())

    uninterrupted = next_update(model, optimizer, generator)
    restored = GPT(ModelConfig(**checkpoint['config']))
    restored.load_state_dict(checkpoint['model'])
    resumed_optimizer = torch.optim.AdamW(restored.parameters(), lr=.006, weight_decay=.01)
    resumed_optimizer.load_state_dict(checkpoint['optimizer'])
    resumed_rng = torch.Generator(); resumed_rng.set_state(checkpoint['rng'])
    torch.set_rng_state(checkpoint['torch_rng'])
    resumed = next_update(restored, resumed_optimizer, resumed_rng)
    assert uninterrupted == resumed
    assert all(torch.equal(a, b) for a, b in zip(model.parameters(), restored.parameters()))

    # Independent gradient-equivalence check before clipping/optimizer state.
    model.eval()
    batch = train[:9]
    optimizer.zero_grad(set_to_none=True)
    _, full_loss = model(batch[:, :-1], batch[:, 1:]); full_loss.backward()
    full_grads = [p.grad.clone() for p in model.parameters()]
    optimizer.zero_grad(set_to_none=True)
    for micro in (batch[:2], batch[2:]):
        logits, _ = model(micro[:, :-1])
        (F.cross_entropy(logits.flatten(0, 1), micro[:, 1:].flatten(), reduction='sum') / batch[:, 1:].numel()).backward()
    error = max(float((p.grad - g).abs().max()) for p, g in zip(model.parameters(), full_grads))
    assert error < 2e-6, error
    final = evaluate(validation)
    assert final < initial, 'This fixed toy run should learn its transition pattern'
    model.eval(); torch.manual_seed(seed + 100)
    sample = model.generate(torch.tensor([[0]]), 16, top_k=3).tolist()[0]
    report = dict(seed=seed, updates=updates, config=config.to_dict(), parameters=model.parameter_count(False),
        split_sizes=[len(train), len(validation), len(test)],
        data_sha256=hashlib.sha256(torch.cat([train, validation, test]).numpy().tobytes()).hexdigest(),
        initial_validation_nll=initial, final_validation_nll=final, test_nll=evaluate(test),
        accumulation_max_error=error, resume_exact=True, history=history, generated_ids=sample,
        tokenizer=dict(symbols=list('abcdefgh'),ids=list(range(8))),generated_text=''.join('abcdefgh'[i] for i in sample),
        limitation='Synthetic transition language; not a general-purpose LLM. Test used once after a fixed recipe.')
    return model, report


if __name__ == '__main__':
    _, report = scratch_pretrain()
    print(json.dumps(report, indent=2))
