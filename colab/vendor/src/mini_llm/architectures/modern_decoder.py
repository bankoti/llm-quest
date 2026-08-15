"""A configurable modern decoder assembled from the educational components."""

from dataclasses import dataclass
from typing import Optional, Tuple

import torch
import torch.nn as nn
from torch.nn import functional as F

from ..models import sample_next_token
from .components import GroupedQueryAttention, RMSNorm, SparseMoE, SwiGLU


@dataclass
class ModernDecoderConfig:
    vocab_size: int
    block_size: int = 128
    layers: int = 4
    width: int = 128
    query_heads: int = 8
    key_value_heads: int = 2
    hidden_width: int = 352
    dropout: float = 0.0
    rope_base: float = 10_000.0
    window_size: Optional[int] = None
    num_experts: int = 0
    experts_per_token: int = 2
    auxiliary_loss_weight: float = 0.01

    def __post_init__(self) -> None:
        if self.width % self.query_heads != 0:
            raise ValueError("width must be divisible by query_heads")
        if self.query_heads % self.key_value_heads != 0:
            raise ValueError("query_heads must be divisible by key_value_heads")
        if self.num_experts == 1:
            raise ValueError("Use zero experts for dense mode or at least two for MoE")


class ModernDecoderBlock(nn.Module):
    def __init__(self, config: ModernDecoderConfig) -> None:
        super().__init__()
        self.attention_norm = RMSNorm(config.width)
        self.attention = GroupedQueryAttention(
            width=config.width,
            query_heads=config.query_heads,
            key_value_heads=config.key_value_heads,
            block_size=config.block_size,
            window_size=config.window_size,
            rope_base=config.rope_base,
            dropout=config.dropout,
        )
        self.feed_forward_norm = RMSNorm(config.width)
        self.is_sparse = config.num_experts > 0
        if self.is_sparse:
            self.feed_forward = SparseMoE(
                width=config.width,
                hidden_width=config.hidden_width,
                num_experts=config.num_experts,
                experts_per_token=config.experts_per_token,
            )
        else:
            self.feed_forward = SwiGLU(config.width, config.hidden_width)

    def forward(self, inputs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        inputs = inputs + self.attention(self.attention_norm(inputs))
        normalized = self.feed_forward_norm(inputs)
        if self.is_sparse:
            feed_forward_output, auxiliary_loss, _ = self.feed_forward(normalized)
        else:
            feed_forward_output = self.feed_forward(normalized)
            auxiliary_loss = torch.zeros((), device=inputs.device)
        return inputs + feed_forward_output, auxiliary_loss


class ModernDecoderLM(nn.Module):
    """A Llama/Mistral-like teaching model, not an exact checkpoint replica."""

    def __init__(self, config: ModernDecoderConfig) -> None:
        super().__init__()
        self.config = config
        self.token_embedding = nn.Embedding(config.vocab_size, config.width)
        self.blocks = nn.ModuleList(
            [ModernDecoderBlock(config) for _ in range(config.layers)]
        )
        self.final_norm = RMSNorm(config.width)
        self.lm_head = nn.Linear(config.width, config.vocab_size, bias=False)
        self.lm_head.weight = self.token_embedding.weight
        self.apply(self._initialize_weights)

    @staticmethod
    def _initialize_weights(module: nn.Module) -> None:
        if isinstance(module, (nn.Linear, nn.Embedding)):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(
        self, inputs: torch.Tensor, targets: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], torch.Tensor]:
        if inputs.size(1) > self.config.block_size:
            raise ValueError("sequence length exceeds block_size")
        hidden = self.token_embedding(inputs)
        auxiliary_losses = []
        for block in self.blocks:
            hidden, auxiliary_loss = block(hidden)
            auxiliary_losses.append(auxiliary_loss)
        logits = self.lm_head(self.final_norm(hidden))

        mean_auxiliary_loss = torch.stack(auxiliary_losses).mean()
        loss = None
        if targets is not None:
            language_model_loss = F.cross_entropy(
                logits.reshape(-1, self.config.vocab_size), targets.reshape(-1)
            )
            loss = (
                language_model_loss
                + self.config.auxiliary_loss_weight * mean_auxiliary_loss
            )
        return logits, loss, mean_auxiliary_loss

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
            logits, _, _ = self(context)
            next_token = sample_next_token(logits[:, -1], temperature, top_k)
            tokens = torch.cat((tokens, next_token), dim=1)
        return tokens
