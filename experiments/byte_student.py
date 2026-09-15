"""A learned token teacher and four byte-student arms on synthetic segmented text.

CPU: uv run --with numpy --with torch python experiments/byte_student.py
No pretrained weights, private data, or GPU. This tests a mechanism, not a
scaling frontier. The same raw-data schedule is NOT equal compute across arms.
"""
import json
import math
import time
from pathlib import Path
import runpy
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

VOCAB = [b'a', b'ab', b'ac', b'b', b'ba', b'c', b'ca']
BYTE_BOS, BYTE_EOT = 257, 256

class ByteLabLM(nn.Module):
    def __init__(self, inputs, outputs, width, context):
        super().__init__()
        self.embedding = nn.Embedding(inputs, width)
        self.position = nn.Parameter(torch.zeros(context, width))
        self.norm1, self.norm2 = nn.LayerNorm(width), nn.LayerNorm(width)
        self.qkv, self.proj = nn.Linear(width, 3*width), nn.Linear(width, width)
        self.ff = nn.Sequential(nn.Linear(width, 4*width), nn.GELU(), nn.Linear(4*width, width))
        self.head = nn.Linear(width, outputs)

    def forward(self, ids):
        x = self.embedding(ids) + self.position[:ids.shape[1]]
        q, k, v = self.qkv(self.norm1(x)).chunk(3, dim=-1)
        x = x + self.proj(F.scaled_dot_product_attention(q, k, v, is_causal=True))
        return self.head(x + self.ff(self.norm2(x)))

def segmented_data(count, seed, excluded=()):
    rng = np.random.default_rng(seed)
    rows, seen = [], set(excluded)
    seen_text = {b''.join(VOCAB[i] for i in row) for row in seen}
    while len(rows) < count:
        row = [int(rng.integers(len(VOCAB)))]
        for _ in range(7):
            row.append(int((row[-1] + rng.choice([1, 2, 3], p=[.65, .25, .1])) % len(VOCAB)))
        row = tuple(row)
        text = b''.join(VOCAB[i] for i in row)
        if row not in seen and text not in seen_text:
            rows.append(row)
            seen.add(row)
            seen_text.add(text)
    return torch.tensor(rows)

def token_inputs(ids):
    return torch.cat([torch.full((len(ids), 1), len(VOCAB)), ids[:, :-1]], dim=1)

def byte_dataset(ids, teacher_logits, with_eot, convert):
    size = 257 if with_eot else 256
    sequences, targets, content = [], [], []
    for sequence, logits in zip(ids.tolist(), teacher_logits.numpy()):
        symbols, soft = [], []
        for token_id, teacher_row in zip(sequence, logits):
            token = VOCAB[token_id]
            for offset, symbol in enumerate(list(token) + ([BYTE_EOT] if with_eot else [])):
                symbols.append(symbol)
                soft.append(convert(teacher_row, VOCAB, token[:offset], with_eot))
        sequences.append(symbols)
        targets.append(np.array(soft))
        content.append(sum(len(VOCAB[i]) for i in sequence))
    length = max(map(len, sequences))
    x = torch.full((len(ids), length), BYTE_BOS)
    y = torch.zeros_like(x)
    p = torch.zeros(len(ids), length, size)
    mask = torch.zeros(len(ids), length, dtype=torch.bool)
    for row, (symbols, soft) in enumerate(zip(sequences, targets)):
        n = len(symbols)
        x[row, :n] = torch.tensor([BYTE_BOS] + symbols[:-1])
        y[row, :n] = torch.tensor(symbols)
        p[row, :n] = torch.from_numpy(soft).float()
        mask[row, :n] = True
    assert torch.allclose(p.sum(-1)[mask], torch.ones_like(p.sum(-1)[mask]), atol=1e-6)
    return x, y, p, mask, torch.tensor(content)

def student_loss(logits, y, targets, mask, distilled):
    log_q = logits.log_softmax(-1)
    if distilled:
        losses = (targets * (targets.clamp_min(1e-30).log() - log_q)).sum(-1)
    else:
        losses = -log_q.gather(-1, y.unsqueeze(-1)).squeeze(-1)
    return losses[mask].mean()

@torch.no_grad()
def decode_fixed_content(model, mode, count=8):
    ids, output = [len(VOCAB) if mode == 'token' else BYTE_BOS], bytearray()
    for _ in range(64):
        logits = model(torch.tensor([ids]))[0, -1]
        if mode != 'token':
            # Declared toy constrained decoding: ASCII a/b/c, plus EOT if present.
            allowed = [97, 98, 99] + ([BYTE_EOT] if mode == 'eot' else [])
            blocked = torch.full_like(logits, -torch.inf)
            blocked[allowed] = logits[allowed]
            logits = blocked
        choice = int(logits.argmax())
        ids.append(choice)
        if mode == 'token':
            output.extend(VOCAB[choice])
        elif choice != BYTE_EOT:
            output.append(choice)
        if len(output) >= count:
            return bytes(output[:count]), len(ids)-1
    return bytes(output), len(ids)-1

def latency_report(model, mode):
    model.eval()
    for _ in range(2):
        decode_fixed_content(model, mode)
    samples, complete = [], True
    for _ in range(5):
        start = time.perf_counter()
        output, units = decode_fixed_content(model, mode)
        samples.append((time.perf_counter()-start)*1000)
        complete = complete and len(output) == 8
    return {'completed_8_bytes': complete, 'generated_ascii': output.decode('ascii'),
            'last_decode_units': units, 'median_ms': float(np.median(samples)),
            'p95_ms_nearest_rank': max(samples),
            'sequential_bytes_per_second': 40000/sum(samples) if complete else None,
            'parameter_storage_bytes': sum(p.numel()*p.element_size() for p in model.parameters())}

def run_byte_experiment(convert=None, steps=50, seeds=(3, 13)):
    if convert is None:
        file = Path(__file__).resolve().parents[1] / 'public/content/solutions/c9/09_byte_distillation.py'
        convert = runpy.run_path(str(file))['byte_targets']
    torch.set_num_threads(1)
    torch.manual_seed(23)
    train = segmented_data(192, 101)
    val = segmented_data(64, 202, map(tuple, train.tolist()))
    teacher = ByteLabLM(8, 7, 48, 9)
    optimizer = torch.optim.AdamW(teacher.parameters(), lr=.006)
    for step in range(80):
        idx = torch.arange(step*32, (step+1)*32) % len(train)
        loss = F.cross_entropy(teacher(token_inputs(train[idx])).flatten(0,1), train[idx].flatten())
        optimizer.zero_grad(); loss.backward(); optimizer.step()
    teacher.eval()
    with torch.no_grad():
        train_logits, val_logits = teacher(token_inputs(train)), teacher(token_inputs(val))
        teacher_nll = F.cross_entropy(val_logits.flatten(0,1), val.flatten(), reduction='sum')
    datasets = {eot: (byte_dataset(train, train_logits, eot, convert), byte_dataset(val, val_logits, eot, convert)) for eot in [False, True]}
    teacher_params = sum(p.numel() for p in teacher.parameters())
    rows = []
    for seed in seeds:
        for eot, distilled in [(False, False), (False, True), (True, False), (True, True)]:
            torch.manual_seed(seed)
            model = ByteLabLM(258, 257 if eot else 256, 16, 65)
            parameters = sum(p.numel() for p in model.parameters())
            assert parameters < teacher_params
            optimizer = torch.optim.AdamW(model.parameters(), lr=.01)
            (x, y, p, mask, content), validation = datasets[eot]
            initial = float(student_loss(model(x[:16]), y[:16], p[:16], mask[:16], distilled).detach())
            symbols_seen, content_seen = 0, 0
            started = time.perf_counter()
            for step in range(steps):
                idx = torch.arange(step*16, (step+1)*16) % len(x)
                for group in optimizer.param_groups:
                    group['lr'] = .01 * (.1 + .9 * .5 * (1 + math.cos(math.pi*step/steps)))
                loss = student_loss(model(x[idx]), y[idx], p[idx], mask[idx], distilled)
                optimizer.zero_grad(); loss.backward(); optimizer.step()
                symbols_seen += int(mask[idx].sum())
                content_seen += int(content[idx].sum())
            training_seconds = time.perf_counter()-started
            model.eval()
            with torch.no_grad():
                final = float(student_loss(model(x[:16]), y[:16], p[:16], mask[:16], distilled))
                vx, vy, _, vm, vc = validation
                nll = F.cross_entropy(model(vx).flatten(0,1), vy.flatten(), reduction='none').reshape_as(vy)
                bpb = float(nll[vm].sum() / (vc.sum()*math.log(2)))
            assert math.isfinite(bpb) and math.isfinite(final)
            rows.append({'seed': seed, 'representation': 'bytes+EOT' if eot else 'bytes',
                         'objective': 'distillation_KL' if distilled else 'supervised_CE',
                         'parameters': parameters, 'train_content_bytes_seen': content_seen,
                         'train_prediction_units_seen': symbols_seen,
                         'parameter_unit_work_proxy_6NU': 6*parameters*symbols_seen,
                         'training_seconds': training_seconds, 'initial_train_loss': initial,
                         'final_train_loss': final, 'validation_representation_BPB': bpb,
                         'serving': latency_report(model, 'eot' if eot else 'bytes')})
    return {'setup': {'torch': torch.__version__, 'device': 'CPU', 'threads': 1,
                      'teacher_parameters': teacher_params, 'teacher_training_steps': 80,
                      'student_steps': steps, 'teacher_representation_BPB': float(teacher_nll/(datasets[False][1][4].sum()*math.log(2))),
                      'teacher_serving': latency_report(teacher, 'token')}, 'rows': rows}

if __name__ == '__main__':
    RESULTS = run_byte_experiment(globals().get('byte_targets'))
    print(json.dumps(RESULTS, indent=2))
    print('Synthetic segmented text, not a learned BPE tokenizer or the paper corpus. Fixed raw-data schedule, unequal compute. 6NU is a work proxy, not measured FLOPs. Teacher training/conversion costs are separate. BPB scores the declared representation, including EOT losses where present. CPU decoding is constrained to a/b/c and 8 returned bytes, with no KV cache; tensor storage is not peak RAM. No scaling or production-quality win is established.')
