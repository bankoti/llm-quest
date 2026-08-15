from dataclasses import asdict, dataclass
from typing import Dict, Any


@dataclass
class ModelConfig:
    vocab_size: int
    block_size: int = 64
    n_layer: int = 2
    n_head: int = 4
    n_embd: int = 64
    dropout: float = 0.1
    bias: bool = False

    def __post_init__(self) -> None:
        if self.n_embd % self.n_head != 0:
            raise ValueError("n_embd must be divisible by n_head")
        if self.vocab_size <= 0 or self.block_size <= 0:
            raise ValueError("vocab_size and block_size must be positive")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
