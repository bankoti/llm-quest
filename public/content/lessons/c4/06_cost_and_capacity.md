# 06 - Model Cost, Capacity, and Break-Even

Architecture economics begin with workload units. Record requests per second,
head/tail mix, input and output token distributions, candidates reranked, cache
hit rate, concurrency, data growth, and required regions. A monthly model bill
without workload assumptions cannot be compared or reproduced.

## Expected online cost

For route `i` with traffic share `p_i`, hit or success probability `h_i`, and
per-request cost `c_i`, expected variable cost is:

```text
E[cost/request] = sum_i p_i * c_i
```

Include retries, fallbacks, observability, storage, and egress. For a head cache,
separate refresh cost from read cost. For generation, model input and output
tokens independently; output often costs more and has a heavier tail.

## Capacity is constrained by the bottleneck

Estimate each stage’s service time and concurrency. A model that averages 20 ms
may still violate p99 under bursty traffic because queues grow near saturation.
Use load tests in Course 7; here reserve capacity and identify the likely
bottleneck: accelerator memory, decode throughput, vector index, database pool,
or network.

## Offline versus online break-even

![Break-even request volume](content/images/c4/break_even.svg)


Suppose offline labeling and student training cost `F`, student serving costs
`c_s` per request, and a live teacher costs `c_t`. Ignoring retraining for a first
estimate:

```text
break_even_requests = F / (c_t - c_s), when c_t > c_s
```

Add refresh frequency, engineering operations, and the student’s quality margin.
A cheaper request is not economical if lower relevance reduces the target
outcome. Report cost per successful result as well as raw inference cost.

## Sensitivity analysis

Vary traffic by 0.5x/1x/3x, cache hit rate, token p95, and refresh frequency.
Name the variable that reverses the decision. Use ranges rather than false
precision for uncertain prices or utilization.

Complete `workbook/05_cost_break_even.py`. Its tiny arithmetic is intentionally
transparent so the architecture review can inspect assumptions.

**Checkpoint:** Produce a monthly low/base/high table and a unit-cost equation.
Separate one-time migration cost, recurring fixed cost, and variable cost.
