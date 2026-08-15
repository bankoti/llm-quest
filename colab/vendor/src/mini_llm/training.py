"""A small but complete training loop with evaluation and checkpointing."""

import math
import random
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Optional

import torch
import torch.nn as nn

from .config import ModelConfig
from .data import TokenDataset
from .models import GPT, build_model
from .tokenizer import BytePairTokenizer, CharacterTokenizer


@dataclass
class TrainingConfig:
    model_type: str = "gpt"
    tokenizer_type: str = "character"
    tokenizer_vocab_size: int = 300
    steps: int = 300
    batch_size: int = 16
    learning_rate: float = 3e-3
    min_learning_rate: float = 3e-4
    warmup_steps: int = 20
    eval_interval: int = 50
    eval_batches: int = 10
    weight_decay: float = 0.1
    grad_clip: float = 1.0
    seed: int = 1337


def select_device(requested: str = "auto") -> torch.device:
    if requested != "auto":
        return torch.device(requested)
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def learning_rate_at(step: int, config: TrainingConfig) -> float:
    if step < config.warmup_steps:
        return config.learning_rate * (step + 1) / max(1, config.warmup_steps)
    if step >= config.steps:
        return config.min_learning_rate
    decay_length = max(1, config.steps - config.warmup_steps)
    ratio = (step - config.warmup_steps) / decay_length
    coefficient = 0.5 * (1.0 + math.cos(math.pi * ratio))
    return config.min_learning_rate + coefficient * (
        config.learning_rate - config.min_learning_rate
    )


@torch.no_grad()
def estimate_loss(
    model: nn.Module,
    dataset: TokenDataset,
    batch_size: int,
    eval_batches: int,
    device: torch.device,
) -> Dict[str, float]:
    model.eval()
    losses: Dict[str, float] = {}
    for split in ("train", "validation"):
        values = torch.zeros(eval_batches)
        for index in range(eval_batches):
            inputs, targets = dataset.sample(split, batch_size, device)
            _, loss = model(inputs, targets)
            assert loss is not None
            values[index] = loss.detach().cpu()
        losses[split] = values.mean().item()
    model.train()
    return losses


def train(
    corpus_path: Path,
    output_path: Path,
    model_config: ModelConfig,
    training_config: TrainingConfig,
    device_name: str = "auto",
) -> Dict[str, object]:
    random.seed(training_config.seed)
    torch.manual_seed(training_config.seed)
    device = select_device(device_name)

    text = corpus_path.read_text(encoding="utf-8")
    if training_config.tokenizer_type == "character":
        tokenizer = CharacterTokenizer.train(text)
    elif training_config.tokenizer_type == "bpe":
        tokenizer = BytePairTokenizer.train(
            text, vocab_size=training_config.tokenizer_vocab_size
        )
    else:
        raise ValueError("tokenizer_type must be 'character' or 'bpe'")
    model_config.vocab_size = tokenizer.vocab_size
    token_ids = torch.tensor(tokenizer.encode(text), dtype=torch.long)
    dataset = TokenDataset(
        token_ids, model_config.block_size, seed=training_config.seed
    )
    model = build_model(training_config.model_type, model_config).to(device)

    if isinstance(model, GPT):
        parameter_groups = model.optimizer_groups(training_config.weight_decay)
    else:
        parameter_groups = model.parameters()
    optimizer = torch.optim.AdamW(
        parameter_groups,
        lr=training_config.learning_rate,
        betas=(0.9, 0.95),
    )

    final_metrics: Dict[str, float] = {}
    print(
        f"device={device} model={training_config.model_type} "
        f"parameters={sum(p.numel() for p in model.parameters()):,} "
        f"tokens={len(token_ids):,} vocab={tokenizer.vocab_size}"
    )
    for step in range(training_config.steps):
        if step % training_config.eval_interval == 0 or step == training_config.steps - 1:
            final_metrics = estimate_loss(
                model,
                dataset,
                training_config.batch_size,
                training_config.eval_batches,
                device,
            )
            print(
                f"step={step:04d} train_loss={final_metrics['train']:.4f} "
                f"validation_loss={final_metrics['validation']:.4f}"
            )

        rate = learning_rate_at(step, training_config)
        for group in optimizer.param_groups:
            group["lr"] = rate
        inputs, targets = dataset.sample(
            "train", training_config.batch_size, device
        )
        _, loss = model(inputs, targets)
        assert loss is not None
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), training_config.grad_clip)
        optimizer.step()

    checkpoint: Dict[str, object] = {
        "model_type": training_config.model_type,
        "model_config": model_config.to_dict(),
        "training_config": asdict(training_config),
        "model_state": model.state_dict(),
        "optimizer_state": optimizer.state_dict(),
        "tokenizer": tokenizer.to_dict(),
        "metrics": final_metrics,
        "step": training_config.steps,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(checkpoint, output_path)
    print(f"checkpoint={output_path}")
    return checkpoint
