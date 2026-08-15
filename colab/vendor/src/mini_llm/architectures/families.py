"""Minimal encoder-only and encoder-decoder architecture families."""

from typing import Optional, Tuple

import torch
import torch.nn as nn
from torch.nn import functional as F


class BidirectionalEncoder(nn.Module):
    """A BERT-shaped masked-token encoder with unrestricted self-attention."""

    def __init__(
        self,
        vocab_size: int,
        block_size: int,
        width: int,
        heads: int,
        layers: int,
        hidden_width: int,
    ) -> None:
        super().__init__()
        self.vocab_size = vocab_size
        self.block_size = block_size
        self.token_embedding = nn.Embedding(vocab_size, width)
        self.position_embedding = nn.Embedding(block_size, width)
        layer = nn.TransformerEncoderLayer(
            d_model=width,
            nhead=heads,
            dim_feedforward=hidden_width,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(
            layer, num_layers=layers, enable_nested_tensor=False
        )
        self.final_norm = nn.LayerNorm(width)
        self.masked_lm_head = nn.Linear(width, vocab_size)

    def forward(
        self, inputs: torch.Tensor, targets: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        _, time_steps = inputs.shape
        if time_steps > self.block_size:
            raise ValueError("sequence length exceeds block_size")
        positions = torch.arange(time_steps, device=inputs.device)
        hidden = self.token_embedding(inputs) + self.position_embedding(positions)
        hidden = self.encoder(hidden)
        logits = self.masked_lm_head(self.final_norm(hidden))
        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, self.vocab_size),
                targets.reshape(-1),
                ignore_index=-100,
            )
        return logits, loss


class EncoderDecoderTransformer(nn.Module):
    """A T5-shaped text-to-text model with encoder, decoder, and cross-attention."""

    def __init__(
        self,
        vocab_size: int,
        block_size: int,
        width: int,
        heads: int,
        encoder_layers: int,
        decoder_layers: int,
        hidden_width: int,
    ) -> None:
        super().__init__()
        self.vocab_size = vocab_size
        self.block_size = block_size
        self.token_embedding = nn.Embedding(vocab_size, width)
        self.position_embedding = nn.Embedding(block_size, width)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=width,
            nhead=heads,
            dim_feedforward=hidden_width,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=width,
            nhead=heads,
            dim_feedforward=hidden_width,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(
            encoder_layer, encoder_layers, enable_nested_tensor=False
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, decoder_layers)
        self.final_norm = nn.LayerNorm(width)
        self.lm_head = nn.Linear(width, vocab_size, bias=False)
        self.lm_head.weight = self.token_embedding.weight

    def _embed(self, token_ids: torch.Tensor) -> torch.Tensor:
        time_steps = token_ids.size(1)
        if time_steps > self.block_size:
            raise ValueError("sequence length exceeds block_size")
        positions = torch.arange(time_steps, device=token_ids.device)
        return self.token_embedding(token_ids) + self.position_embedding(positions)

    def forward(
        self,
        source: torch.Tensor,
        decoder_inputs: torch.Tensor,
        targets: Optional[torch.Tensor] = None,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        memory = self.encoder(self._embed(source))
        target_length = decoder_inputs.size(1)
        causal_mask = nn.Transformer.generate_square_subsequent_mask(
            target_length, device=decoder_inputs.device
        )
        hidden = self.decoder(
            self._embed(decoder_inputs), memory, tgt_mask=causal_mask
        )
        logits = self.lm_head(self.final_norm(hidden))
        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, self.vocab_size), targets.reshape(-1)
            )
        return logits, loss
