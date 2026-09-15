# ZeRO: Training State Has Owners

Prerequisites: gradients, Adam, data-parallel batch averaging, and byte counts.
Allow 60-90 minutes. You will build a memory model and simulate a sharded Adam
update, then prove it agrees with an unsharded baseline over multiple steps.

## The problem

A data-parallel training job has one logical model and multiple workers. Each
worker computes gradients from its own batch. Replicating every optimizer array
on every worker consumes memory without adding capacity to the learned model.
ZeRO removes replicas by assigning portions of training state to different
workers. Communication makes the required state available at the right time.

For this lab's mixed-precision recipe, each parameter needs:

| State | Bytes | Purpose |
|---|---:|---|
| Model weight | 2 | Forward/backward arithmetic |
| Gradient | 2 | Accumulated update signal |
| Master weight | 4 | Higher-precision optimizer update |
| Adam first moment | 4 | Smoothed gradient |
| Adam second moment | 4 | Smoothed squared gradient |

That is 16N bytes before activations or buffers. These are declared assumptions,
not a requirement that every framework uses 2-byte gradients.

## Derive each stage

Let R be workers and S be the largest shard, `ceil(N/R)` parameters.

| Stage | Weights | Gradients | Optimizer including master weights |
|---|---:|---:|---:|
| 0: replicated | 2N | 2N | 12N |
| 1 | 2N | 2N | 12S |
| 2 | 2N | 2S | 12S |
| 3 | 2S | 2S | 12S |

For one billion parameters and four workers, totals are 16, 7, 5.5, and 4 GB per
worker. The cluster still represents the same billion parameters. If N=5 and
R=2, shards contain 3 and 2 parameters; integer division alone undercounts the
larger worker. Our partitions are unpadded.

Activations, temporary gathered weights, communication buffers, fragmentation,
and checkpoints are separate. Stage 3's persistent total is not a peak-memory
prediction. More communication or recomputation can trade speed for capacity.

## Trace one optimizer step

Suppose rank gradients are `[2,4,6,8]` and `[4,6,8,10]`. Their equally sized
batches imply mean gradient `[3,5,7,9]`. A reduce-scatter combines gradients and
delivers `[3,5]` to owner 0 and `[7,9]` to owner 1. If batches have unequal token
counts, weight contributions by those counts; the exercise assumes equal batches.

Each owner keeps its own Adam history. For step t starting at 1:

```text
m = 0.9*m + 0.1*g
v = 0.999*v + 0.001*g*g
m_hat = m / (1 - 0.9**t)
v_hat = v / (1 - 0.999**t)
p_new = p - learning_rate * m_hat / (sqrt(v_hat) + 1e-8)
```

Initialize moments to zero only at the start of training. Resetting them each
step silently changes the optimizer. An all-gather can make updated weights
available for computation. Do not confuse gradient reduction with concatenating
different parameter slices.

## Your implementation

`zero_memory` returns component byte counts for the largest worker.
`sharded_adam_step` accepts disjoint parameter/moment shards and full per-rank
gradient vectors. Average, slice by actual shard lengths, update, and return new
lists without mutating inputs. Empty shards are valid when R>N.

The reference solution centrally averages arrays to model reduce-scatter. It
validates owner-update math, but it does not reduce this Python process's peak
memory or measure distributed communication. Do not label its runtime as a ZeRO
benchmark.

## Verification and experiments

The grader compares four successive updates with a separate dense Adam
calculation for 1, 2, 4, and 9 owners, including uneven and empty shards. It also
checks all memory stages and invalid inputs. In the notebook, change the number
of owners while keeping the same global gradient. Reconstructed parameters must
remain identical within numerical tolerance.

Deliberately replace the average with a sum or reset moments each step. Identify
the failing invariant. For a real distributed extension, instrument peak memory,
bytes communicated, and tokens/second using a documented DeepSpeed or FSDP
configuration; FSDP naming and policies are not interchangeable with all ZeRO
stages. That hardware extension is beyond this CPU simulator.

**Exit check:** Explain the difference between persistent state and peak memory;
reconstruct one parameter update; defend which stage fits a memory constraint.

Primary source: [Rajbhandari et al., ZeRO](https://arxiv.org/abs/1910.02054).
