"""Boss Level — Training Recipe Defense

Fill in TrainingRecipe so that recipe.validate() returns a passing RecipeReport.
All five constraints must pass simultaneously.
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
        report = RecipeReport()
        notes = report.notes

        # 1. Compute budget: 6*N*D <= 2e23
        actual_flops = 6 * self.params * self.tokens
        report.compute_ok = actual_flops <= 2e23
        if not report.compute_ok:
            notes.append(f"compute: {actual_flops:.2e} > 2e23")

        # 2. Model fits in 40GB at bfloat16
        model_gb = self.params * 2 / 1e9
        report.memory_ok = model_gb <= 40.0
        if not report.memory_ok:
            notes.append(f"memory: {model_gb:.1f}GB > 40GB")

        # 3. KV cache: 64 contexts * 2048 tokens fit in remaining GPU memory
        remaining_gb = 40.0 - model_gb if report.memory_ok else 0
        kv_bytes = (2 * self.num_kv_heads * self.head_dim * 2 *
                    self.num_layers * 64 * 2048)
        kv_gb = kv_bytes / 1e9
        report.kv_cache_ok = kv_gb <= remaining_gb
        if not report.kv_cache_ok:
            notes.append(f"kv_cache: {kv_gb:.1f}GB > {remaining_gb:.1f}GB remaining")

        # 4. Alignment: valid DPO configuration
        dpo_margin = (self.beta * self.log_pi_chosen_minus_ref
                      - self.beta * self.log_pi_rejected_minus_ref)
        report.alignment_ok = (0 < self.beta <= 1.0 and
                               self.log_pi_chosen_minus_ref > 0 and
                               self.log_pi_rejected_minus_ref < 0 and
                               dpo_margin > 0)
        if not report.alignment_ok:
            notes.append(f"alignment: beta={self.beta}, margin={dpo_margin:.3f}")

        return report


# TODO: fill in values that make recipe.validate().passed == True
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
