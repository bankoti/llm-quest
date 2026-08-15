"""A bigram baseline and a small decoder-only Transformer."""

import math
from typing import Dict, Optional, Tuple

import torch
import torch.nn as nn
from torch.nn import functional as F

from .config import ModelConfig


def sample_next_token(
    logits: torch.Tensor, temperature: float = 1.0, top_k: Optional[int] = None
) -> torch.Tensor:
    if temperature <= 0:
        raise ValueError("temperature must be greater than zero")
    logits = logits / temperature
    if top_k is not None:
        top_k = min(top_k, logits.size(-1))
        threshold = torch.topk(logits, top_k).values[:, [-1]]
        logits = logits.masked_fill(logits < threshold, float("-inf"))
    probabilities = F.softmax(logits, dim=-1)
    return torch.multinomial(probabilities, num_samples=1)


class BigramLanguageModel(nn.Module):
    """Each token directly stores logits for the token that follows it."""

    def __init__(self, vocab_size: int) -> None:
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, vocab_size)
        nn.init.zeros_(self.token_embedding.weight)
        self.vocab_size = vocab_size

    def forward(
        self, inputs: torch.Tensor, targets: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        logits = self.token_embedding(inputs)
        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, self.vocab_size), targets.reshape(-1)
            )
        return logits, loss

    @torch.no_grad()
    def generate(
        self,
        tokens: torch.Tensor,
        max_new_tokens: int,
        temperature: float = 1.0,
        top_k: Optional[int] = None,
    ) -> torch.Tensor:
        for _ in range(max_new_tokens):
            logits, _ = self(tokens[:, -1:])
            next_token = sample_next_token(logits[:, -1, :], temperature, top_k)
            tokens = torch.cat((tokens, next_token), dim=1)
        return tokens


class CausalSelfAttention(nn.Module):
    def __init__(self, config: ModelConfig) -> None:
        super().__init__()
        self.n_head = config.n_head
        self.n_embd = config.n_embd
        self.head_dim = config.n_embd // config.n_head
        self.query_key_value = nn.Linear(
            config.n_embd, 3 * config.n_embd, bias=config.bias
        )
        self.projection = nn.Linear(config.n_embd, config.n_embd, bias=config.bias)
        self.attention_dropout = nn.Dropout(config.dropout)
        self.residual_dropout = nn.Dropout(config.dropout)
        causal_mask = torch.tril(torch.ones(config.block_size, config.block_size))
        self.register_buffer(
            "causal_mask", causal_mask.view(1, 1, config.block_size, config.block_size)
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        batch_size, time_steps, channels = inputs.shape
        qkv = self.query_key_value(inputs)
        query, key, value = qkv.split(self.n_embd, dim=2)

        def split_heads(tensor: torch.Tensor) -> torch.Tensor:
            return tensor.view(
                batch_size, time_steps, self.n_head, self.head_dim
            ).transpose(1, 2)

        query, key, value = map(split_heads, (query, key, value))
        attention = (query @ key.transpose(-2, -1)) / math.sqrt(self.head_dim)
        attention = attention.masked_fill(
            self.causal_mask[:, :, :time_steps, :time_steps] == 0, float("-inf")
        )
        weights = self.attention_dropout(F.softmax(attention, dim=-1))
        output = weights @ value
        output = output.transpose(1, 2).contiguous().view(
            batch_size, time_steps, channels
        )
        return self.residual_dropout(self.projection(output))


class FeedForward(nn.Module):
    def __init__(self, config: ModelConfig) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(config.n_embd, 4 * config.n_embd, bias=config.bias),
            nn.GELU(),
            nn.Linear(4 * config.n_embd, config.n_embd, bias=config.bias),
            nn.Dropout(config.dropout),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.layers(inputs)


class TransformerBlock(nn.Module):
    def __init__(self, config: ModelConfig) -> None:
        super().__init__()
        self.attention_norm = nn.LayerNorm(config.n_embd)
        self.attention = CausalSelfAttention(config)
        self.feed_forward_norm = nn.LayerNorm(config.n_embd)
        self.feed_forward = FeedForward(config)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        inputs = inputs + self.attention(self.attention_norm(inputs))
        inputs = inputs + self.feed_forward(self.feed_forward_norm(inputs))
        return inputs


class GPT(nn.Module):
    """A compact GPT-2-style decoder-only Transformer."""

    def __init__(self, config: ModelConfig) -> None:
        super().__init__()
        self.config = config
        self.token_embedding = nn.Embedding(config.vocab_size, config.n_embd)
        self.position_embedding = nn.Embedding(config.block_size, config.n_embd)
        self.dropout = nn.Dropout(config.dropout)
        self.blocks = nn.ModuleList(
            [TransformerBlock(config) for _ in range(config.n_layer)]
        )
        self.final_norm = nn.LayerNorm(config.n_embd)
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)

        # Input and output embeddings describe the same token space.
        self.lm_head.weight = self.token_embedding.weight
        self.apply(self._initialize_weights)

    @staticmethod
    def _initialize_weights(module: nn.Module) -> None:
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(
        self, inputs: torch.Tensor, targets: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        _, time_steps = inputs.shape
        if time_steps > self.config.block_size:
            raise ValueError(
                f"Sequence length {time_steps} exceeds block size "
                f"{self.config.block_size}"
            )
        positions = torch.arange(time_steps, device=inputs.device)
        hidden = self.token_embedding(inputs) + self.position_embedding(positions)
        hidden = self.dropout(hidden)
        for block in self.blocks:
            hidden = block(hidden)
        logits = self.lm_head(self.final_norm(hidden))

        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, self.config.vocab_size), targets.reshape(-1)
            )
        return logits, loss

    def parameter_count(self, exclude_position_embeddings: bool = True) -> int:
        count = sum(parameter.numel() for parameter in self.parameters())
        if exclude_position_embeddings:
            count -= self.position_embedding.weight.numel()
        return count

    def optimizer_groups(self, weight_decay: float) -> list:
        decay, no_decay = [], []
        for parameter in self.parameters():
            (decay if parameter.dim() >= 2 else no_decay).append(parameter)
        return [
            {"params": decay, "weight_decay": weight_decay},
            {"params": no_decay, "weight_decay": 0.0},
        ]

    @torch.no_grad()
    def generate(
        self,
        tokens: torch.Tensor,
        max_new_tokens: int,
        temperature: float = 1.0,
        top_k: Optional[int] = None,
    ) -> torch.Tensor:
        for _ in range(max_new_tokens):
            context = tokens[:, -self.config.block_size :]
            logits, _ = self(context)
            next_token = sample_next_token(logits[:, -1, :], temperature, top_k)
            tokens = torch.cat((tokens, next_token), dim=1)
        return tokens


def build_model(model_type: str, config: ModelConfig) -> nn.Module:
    if model_type == "bigram":
        return BigramLanguageModel(config.vocab_size)
    if model_type == "gpt":
        return GPT(config)
    raise ValueError("model_type must be 'bigram' or 'gpt'")


def checkpoint_model(checkpoint: Dict[str, object], device: torch.device) -> nn.Module:
    raw_config = checkpoint.get("model_config")
    model_type = checkpoint.get("model_type")
    if not isinstance(raw_config, dict) or not isinstance(model_type, str):
        raise ValueError("Checkpoint is missing model metadata")
    model = build_model(model_type, ModelConfig(**raw_config))
    model.load_state_dict(checkpoint["model_state"])
    return model.to(device)
