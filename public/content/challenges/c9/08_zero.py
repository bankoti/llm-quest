"""ZeRO: model-state accounting and a CPU simulation of an owner update.
This is a simulation of logical ranks, not a distributed runtime.
"""
import numpy as np

def zero_memory(params: int, ranks: int, stage: int) -> dict:
    """Largest rank's persistent state bytes: weights, gradients, optimizer.
    Assume 2-byte weights + 2-byte gradients + 12-byte master/Adam state.
    Stage 0 replicates all; 1 shards optimizer; 2 also gradients; 3 also weights.
    Uneven partitions: largest shard has ceil(params/ranks) elements, no padding.
    params>=0, ranks>0, stage in 0..3; otherwise raise ValueError.
    Excludes activations, communication buffers, allocator and gather peaks.
    """
    raise NotImplementedError

def sharded_adam_step(params, rank_gradients, moments, variances, step, lr=0.01):
    """One logical sharded optimizer step, returning (params, moments, variances).
    Each argument except step/lr is a list of NumPy arrays, one per rank.
    params/moments/variances: disjoint 1D shards, possibly unequal or empty.
    rank_gradients: one FULL gradient vector per rank, equally sized batches.
    Average gradients across ranks, scatter slices to owners, then update each
    owner's Adam moments with beta1=.9, beta2=.999 and bias correction at step>=1.
    eps=1e-8. Do not mutate inputs. Return three lists of updated shards.
    """
    raise NotImplementedError
