"""Token batching for autoregressive next-token prediction."""

from typing import Tuple

import torch


class TokenDataset:
    def __init__(
        self,
        token_ids: torch.Tensor,
        block_size: int,
        train_fraction: float = 0.9,
        seed: int = 1337,
    ) -> None:
        if token_ids.ndim != 1:
            raise ValueError("token_ids must be a one-dimensional tensor")
        if len(token_ids) <= block_size + 1:
            raise ValueError("Corpus is too short for the configured block size")
        if not 0.5 <= train_fraction < 1.0:
            raise ValueError("train_fraction must be in [0.5, 1.0)")

        split_index = int(len(token_ids) * train_fraction)
        if len(token_ids) - split_index <= block_size:
            split_index = len(token_ids) - block_size - 1
        self.train_tokens = token_ids[:split_index]
        self.validation_tokens = token_ids[split_index:]
        self.block_size = block_size
        self.generator = torch.Generator().manual_seed(seed)

    def sample(
        self, split: str, batch_size: int, device: torch.device
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        if split not in {"train", "validation"}:
            raise ValueError("split must be 'train' or 'validation'")
        data = self.train_tokens if split == "train" else self.validation_tokens
        max_start = len(data) - self.block_size
        starts = torch.randint(
            0, max_start, (batch_size,), generator=self.generator
        )
        inputs = torch.stack(
            [data[start : start + self.block_size] for start in starts]
        )
        targets = torch.stack(
            [data[start + 1 : start + self.block_size + 1] for start in starts]
        )
        return inputs.to(device), targets.to(device)
