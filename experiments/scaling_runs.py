"""Small, equal-estimated-compute causal-LM runs, not a Chinchilla reproduction.

CPU: uv run --with torch python experiments/scaling_runs.py
"""
import json
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.set_num_threads(1)

class TinyLanguageModel(nn.Module):
    def __init__(self, width, vocab=16, context=8):
        super().__init__()
        self.embedding = nn.Embedding(vocab, width)
        self.position = nn.Parameter(torch.zeros(context, width))
        self.norm = nn.LayerNorm(width)
        self.qkv = nn.Linear(width, 3 * width)
        self.projection = nn.Linear(width, width)
        self.ffnorm = nn.LayerNorm(width)
        self.ff = nn.Sequential(nn.Linear(width, 4 * width), nn.GELU(), nn.Linear(4 * width, width))
        self.head = nn.Linear(width, vocab)

    def forward(self, ids):
        x = self.embedding(ids) + self.position[:ids.shape[1]]
        q, k, v = self.qkv(self.norm(x)).chunk(3, dim=-1)
        x = x + self.projection(F.scaled_dot_product_attention(q, k, v, is_causal=True))
        return self.head(x + self.ff(self.ffnorm(x)))

def examples(count, seed):
    """Synthetic sequences: next symbol is the sum of the previous two mod 16."""
    generator = torch.Generator().manual_seed(seed)
    data = torch.zeros(count, 9, dtype=torch.long)
    data[:, :2] = torch.randint(0, 16, (count, 2), generator=generator)
    for i in range(2, 9):
        data[:, i] = (data[:, i-1] + data[:, i-2]) % 16
    return data[:, :-1], data[:, 1:]

def run_scaling(budget=3e7):
    train_x, train_y = examples(512, 101)
    val_x, val_y = examples(128, 202)
    rows = []
    for seed in [7, 17, 27]:
        for width in [8, 16, 32]:
            torch.manual_seed(seed)
            model = TinyLanguageModel(width)
            n = sum(p.numel() for p in model.parameters())
            tokens_per_step = 4 * 8
            steps = int(budget // (6 * n * tokens_per_step))
            assert steps > 0
            optimizer = torch.optim.AdamW(model.parameters(), lr=.01)
            for step in range(steps):
                # Match schedules to each run's duration and expose batch rounding.
                warmup = max(1, int(.1 * steps))
                warm = min(1, (step + 1) / warmup)
                cosine = .5 * (1 + math.cos(math.pi * step / max(1, steps)))
                for group in optimizer.param_groups:
                    group['lr'] = .01 * warm * cosine
                idx = (torch.arange(4) + step * 4) % len(train_x)
                optimizer.zero_grad()
                loss = F.cross_entropy(model(train_x[idx]).flatten(0, 1), train_y[idx].flatten())
                loss.backward(); optimizer.step()
            model.eval()
            with torch.no_grad():
                loss = F.cross_entropy(model(val_x).flatten(0, 1), val_y.flatten()).item()
            used = 6 * n * steps * tokens_per_step
            assert used <= budget < used + 6 * n * tokens_per_step
            rows.append(dict(seed=seed, width=width, params=n, tokens=steps*tokens_per_step,
                             steps=steps, estimated_flops=used, utilization=used/budget,
                             validation_loss=loss))
    return rows

if __name__ == '__main__':
    RESULTS = run_scaling()
    print(json.dumps(RESULTS, indent=2))
    print('Synthetic task; held-out draws can share patterns with training. FLOPs use 6ND, not hardware counters. No scaling exponent or universal optimum is established.')
