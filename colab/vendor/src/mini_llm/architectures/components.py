"""Small, explicit versions of components used by modern open LLMs.

These implementations prioritize readable tensor operations and invariant checks.
They are not fused kernels and are not intended to reproduce any one checkpoint.
"""

import math
from typing import Optional, Tuple

import torch
import torch.nn as nn
from torch.nn import functional as F


class RMSNorm(nn.Module):
    """Scale vectors by their root-mean-square without subtracting the mean."""

    def __init__(self, width: int, eps: float = 1e-6) -> None:
        super().__init__()
        self.weight = nn.Parameter(torch.ones(width))
        self.eps = eps

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        original_dtype = inputs.dtype
        values = inputs.float()
        inverse_rms = torch.rsqrt(values.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        normalized = values * inverse_rms
        return (normalized * self.weight.float()).to(original_dtype)


def build_rope_cache(
    sequence_length: int,
    head_size: int,
    device: torch.device,
    dtype: torch.dtype,
    base: float = 10_000.0,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Return cosine and sine tables with shape (T, D/2)."""
    if head_size % 2 != 0:
        raise ValueError("RoPE requires an even head size")
    dimensions = torch.arange(0, head_size, 2, device=device, dtype=torch.float32)
    inverse_frequencies = 1.0 / (base ** (dimensions / head_size))
    positions = torch.arange(sequence_length, device=device, dtype=torch.float32)
    angles = torch.outer(positions, inverse_frequencies)
    return angles.cos().to(dtype), angles.sin().to(dtype)


def rotate_half(inputs: torch.Tensor) -> torch.Tensor:
    """Rotate each adjacent pair (x0, x1) to (-x1, x0)."""
    even = inputs[..., ::2]
    odd = inputs[..., 1::2]
    return torch.stack((-odd, even), dim=-1).flatten(-2)


def apply_rotary_embedding(
    query: torch.Tensor,
    key: torch.Tensor,
    cosine: torch.Tensor,
    sine: torch.Tensor,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Rotate Q and K tensors shaped (B, H, T, D)."""
    cosine_full = cosine.repeat_interleave(2, dim=-1)[None, None, :, :]
    sine_full = sine.repeat_interleave(2, dim=-1)[None, None, :, :]
    rotated_query = query * cosine_full + rotate_half(query) * sine_full
    rotated_key = key * cosine_full + rotate_half(key) * sine_full
    return rotated_query, rotated_key


def causal_attention_mask(
    sequence_length: int,
    device: torch.device,
    window_size: Optional[int] = None,
) -> torch.Tensor:
    """Return a boolean mask where rows are queries and columns are keys."""
    positions = torch.arange(sequence_length, device=device)
    query_positions = positions[:, None]
    key_positions = positions[None, :]
    allowed = key_positions <= query_positions
    if window_size is not None:
        if window_size <= 0:
            raise ValueError("window_size must be positive")
        allowed = allowed & (key_positions > query_positions - window_size)
    return allowed


def repeat_key_value_heads(tensor: torch.Tensor, repeats: int) -> torch.Tensor:
    """Expand KV heads so every query head has a matching key and value head."""
    if repeats <= 0:
        raise ValueError("repeats must be positive")
    return tensor.repeat_interleave(repeats, dim=1)


class GroupedQueryAttention(nn.Module):
    """Causal attention with fewer key/value heads than query heads."""

    def __init__(
        self,
        width: int,
        query_heads: int,
        key_value_heads: int,
        block_size: int,
        window_size: Optional[int] = None,
        rope_base: float = 10_000.0,
        dropout: float = 0.0,
    ) -> None:
        super().__init__()
        if width % query_heads != 0:
            raise ValueError("width must be divisible by query_heads")
        if query_heads % key_value_heads != 0:
            raise ValueError("query_heads must be divisible by key_value_heads")
        self.width = width
        self.query_heads = query_heads
        self.key_value_heads = key_value_heads
        self.head_size = width // query_heads
        self.block_size = block_size
        self.window_size = window_size
        self.rope_base = rope_base
        self.dropout = dropout

        key_value_width = key_value_heads * self.head_size
        self.query_projection = nn.Linear(width, width, bias=False)
        self.key_projection = nn.Linear(width, key_value_width, bias=False)
        self.value_projection = nn.Linear(width, key_value_width, bias=False)
        self.output_projection = nn.Linear(width, width, bias=False)

    def _split_heads(self, tensor: torch.Tensor, heads: int) -> torch.Tensor:
        batch_size, time_steps, _ = tensor.shape
        return tensor.view(batch_size, time_steps, heads, self.head_size).transpose(1, 2)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        batch_size, time_steps, width = inputs.shape
        if width != self.width:
            raise ValueError("input width does not match the attention width")
        if time_steps > self.block_size:
            raise ValueError("sequence length exceeds block_size")

        query = self._split_heads(self.query_projection(inputs), self.query_heads)
        key = self._split_heads(self.key_projection(inputs), self.key_value_heads)
        value = self._split_heads(self.value_projection(inputs), self.key_value_heads)

        cosine, sine = build_rope_cache(
            time_steps, self.head_size, inputs.device, query.dtype, self.rope_base
        )
        query, key = apply_rotary_embedding(query, key, cosine, sine)

        repeats = self.query_heads // self.key_value_heads
        key = repeat_key_value_heads(key, repeats)
        value = repeat_key_value_heads(value, repeats)

        scores = (query @ key.transpose(-2, -1)) / math.sqrt(self.head_size)
        mask = causal_attention_mask(time_steps, inputs.device, self.window_size)
        scores = scores.masked_fill(~mask[None, None, :, :], float("-inf"))
        weights = F.softmax(scores, dim=-1)
        weights = F.dropout(weights, p=self.dropout, training=self.training)
        attended = weights @ value
        attended = attended.transpose(1, 2).contiguous().view(
            batch_size, time_steps, width
        )
        return self.output_projection(attended)


class SwiGLU(nn.Module):
    """A gated feed-forward network using SiLU on the gate branch."""

    def __init__(self, width: int, hidden_width: int) -> None:
        super().__init__()
        self.gate_projection = nn.Linear(width, hidden_width, bias=False)
        self.value_projection = nn.Linear(width, hidden_width, bias=False)
        self.output_projection = nn.Linear(hidden_width, width, bias=False)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        gated = F.silu(self.gate_projection(inputs)) * self.value_projection(inputs)
        return self.output_projection(gated)


class SparseMoE(nn.Module):
    """Token-choice top-k sparse mixture of SwiGLU experts.

    Returns the combined output, a simple load-balancing auxiliary loss, and the
    dense router probabilities for inspection.
    """

    def __init__(
        self,
        width: int,
        hidden_width: int,
        num_experts: int,
        experts_per_token: int = 2,
    ) -> None:
        super().__init__()
        if not 1 <= experts_per_token <= num_experts:
            raise ValueError("experts_per_token must be in [1, num_experts]")
        self.width = width
        self.num_experts = num_experts
        self.experts_per_token = experts_per_token
        self.router = nn.Linear(width, num_experts, bias=False)
        self.experts = nn.ModuleList(
            [SwiGLU(width, hidden_width) for _ in range(num_experts)]
        )

    def forward(
        self, inputs: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        original_shape = inputs.shape
        flat_inputs = inputs.reshape(-1, self.width)
        router_logits = self.router(flat_inputs)
        router_probabilities = F.softmax(router_logits, dim=-1)
        top_weights, top_experts = torch.topk(
            router_probabilities, self.experts_per_token, dim=-1
        )
        top_weights = top_weights / top_weights.sum(dim=-1, keepdim=True)

        combined = torch.zeros_like(flat_inputs)
        for expert_index, expert in enumerate(self.experts):
            token_positions, expert_slots = torch.where(top_experts == expert_index)
            if token_positions.numel() == 0:
                continue
            expert_inputs = flat_inputs[token_positions]
            expert_outputs = expert(expert_inputs)
            weights = top_weights[token_positions, expert_slots, None]
            combined.index_add_(0, token_positions, expert_outputs * weights)

        routing_fraction = F.one_hot(
            top_experts, num_classes=self.num_experts
        ).float().mean(dim=(0, 1))
        mean_router_probability = router_probabilities.mean(dim=0)
        balance_loss = self.num_experts * torch.sum(
            routing_fraction * mean_router_probability
        )
        return (
            combined.view(original_shape),
            balance_loss,
            router_probabilities.view(*original_shape[:-1], self.num_experts),
        )
