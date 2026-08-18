"""Debug Level — The Budget That Forgot Inference

This TrainingBudget class computes a Chinchilla-optimal recommendation.
The math is correct. The design is wrong.

Find and fix the bug.
"""
import math
from dataclasses import dataclass

@dataclass
class TrainingBudget:
    compute_flops: float   # total training compute available

    def optimal_params(self) -> int:
        """Chinchilla-optimal parameter count."""
        return int(math.sqrt(self.compute_flops / 120))

    def optimal_tokens(self) -> int:
        return self.optimal_params() * 20

    def recommend(self) -> dict:
        N = self.optimal_params()
        D = self.optimal_tokens()
        return {
            "params": N,
            "tokens": D,
            "actual_flops": 6 * N * D,
        }

# TASK: The recommend() method ignores a critical production constraint.
# 
# For the scenario below, show what goes wrong:
scenario_compute = 2e23   # FLOPs budget
gpu_memory_gb    = 40     # A100 serving constraint
target_latency_ms = 100   # time-to-first-token target

# TODO: write a fixed_recommend(compute_flops, gpu_memory_gb, bytes_per_param=2)
# that returns a (params, tokens) pair satisfying both the compute budget
# and the inference memory constraint.
def fixed_recommend(compute_flops: float, gpu_memory_gb: float,
                    bytes_per_param: int = 2) -> dict:
    raise NotImplementedError
