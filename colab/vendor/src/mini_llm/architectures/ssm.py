"""An educational selective state-space layer for architecture comparison.

This demonstrates input-dependent recurrent state updates. It is not a Mamba
reproduction: production Mamba adds convolution, gating, specialized parameter
layout, and hardware-aware parallel scan kernels.
"""

import torch
import torch.nn as nn
from torch.nn import functional as F


class SelectiveStateSpaceLayer(nn.Module):
    def __init__(self, width: int, state_size: int = 8) -> None:
        super().__init__()
        self.width = width
        self.state_size = state_size
        projection_width = width * (1 + 2 * state_size)
        self.selection_projection = nn.Linear(width, projection_width)
        self.log_decay_rates = nn.Parameter(torch.zeros(width, state_size))
        self.skip = nn.Parameter(torch.ones(width))
        self.output_projection = nn.Linear(width, width)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        batch_size, time_steps, width = inputs.shape
        if width != self.width:
            raise ValueError("input width does not match layer width")
        selected = self.selection_projection(inputs).view(
            batch_size, time_steps, width, 1 + 2 * self.state_size
        )
        raw_delta = selected[..., 0]
        input_weights = selected[..., 1 : 1 + self.state_size]
        output_weights = selected[..., 1 + self.state_size :]

        delta = F.softplus(raw_delta)
        rates = F.softplus(self.log_decay_rates)[None, :, :]
        state = torch.zeros(
            batch_size, width, self.state_size, device=inputs.device, dtype=inputs.dtype
        )
        outputs = []
        for time_index in range(time_steps):
            decay = torch.exp(-delta[:, time_index, :, None] * rates)
            candidate = input_weights[:, time_index] * inputs[:, time_index, :, None]
            state = decay * state + (1.0 - decay) * candidate
            readout = (output_weights[:, time_index] * state).sum(dim=-1)
            outputs.append(readout + self.skip * inputs[:, time_index])
        stacked = torch.stack(outputs, dim=1)
        return self.output_projection(stacked)
