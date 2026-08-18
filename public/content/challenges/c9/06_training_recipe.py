"""Boss Level — Training Recipe Defense

Two tasks:
1. Implement validate() — the grader feeds it known-good and known-bad
   recipes and checks every flag.
2. Fill in `recipe` with values that pass all four constraints at once.
"""
from dataclasses import dataclass, field
import math

@dataclass
class RecipeReport:
    compute_ok: bool = False
    memory_ok: bool = False
    kv_cache_ok: bool = False
    alignment_ok: bool = False
    notes: list = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all([self.compute_ok, self.memory_ok,
                    self.kv_cache_ok, self.alignment_ok])

@dataclass
class TrainingRecipe:
    # Architecture
    params: int          # total model parameters
    tokens: int          # pretraining token count

    # Serving config
    num_kv_heads: int
    head_dim: int
    num_layers: int

    # Alignment
    beta: float          # DPO beta (0 < beta <= 1)
    log_pi_chosen_minus_ref: float    # should be positive
    log_pi_rejected_minus_ref: float  # should be negative

    def validate(self) -> RecipeReport:
        """Return a RecipeReport with one flag per constraint.

        1. compute_ok: training FLOPs (6 * params * tokens) <= 2e23.
        2. memory_ok: model weights at bfloat16 (params * 2 bytes) fit in
           40 GB (use 1e9 bytes per GB).
        3. kv_cache_ok: the KV cache for 64 concurrent 2048-token contexts
           fits in whatever the weights left free:
             kv_bytes = 2 * num_kv_heads * head_dim * 2 * num_layers * 64 * 2048
           (K and V, times 2 bytes per bf16 value). If memory_ok is False,
           nothing remains: kv_cache_ok must be False too.
        4. alignment_ok: 0 < beta <= 1, log_pi_chosen_minus_ref > 0,
           log_pi_rejected_minus_ref < 0, and the DPO margin
           beta * (chosen - rejected) > 0.

        Append a human-readable note for every failed constraint.
        """
        raise NotImplementedError


# TODO: fill in values so that recipe.validate().passed == True
recipe = TrainingRecipe(
    params=0,           # replace
    tokens=0,           # replace
    num_kv_heads=0,     # replace
    head_dim=0,         # replace
    num_layers=0,       # replace
    beta=0.0,           # replace
    log_pi_chosen_minus_ref=0.0,    # replace
    log_pi_rejected_minus_ref=0.0,  # replace
)
