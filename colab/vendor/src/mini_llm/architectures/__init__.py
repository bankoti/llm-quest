"""Educational implementations of modern language-model architecture components."""

from .components import GroupedQueryAttention, RMSNorm, SparseMoE, SwiGLU
from .families import BidirectionalEncoder, EncoderDecoderTransformer
from .modern_decoder import ModernDecoderConfig, ModernDecoderLM
from .ssm import SelectiveStateSpaceLayer

__all__ = [
    "BidirectionalEncoder",
    "EncoderDecoderTransformer",
    "GroupedQueryAttention",
    "ModernDecoderConfig",
    "ModernDecoderLM",
    "RMSNorm",
    "SelectiveStateSpaceLayer",
    "SparseMoE",
    "SwiGLU",
]
