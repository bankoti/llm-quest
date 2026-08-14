# Debug: KV Cache Overcount

Finance flagged your memory estimate. The estimator an AI wrote runs fine and
its formula looks like every KV-cache formula you have seen. One bug.

## The domain

![Query heads vs KV heads in cache budget](content/images/c3/debug_kv_budget.svg)


Grouped-query attention exists for one reason: the KV cache was eating the
accelerator. GQA keeps many *query* heads for quality but shares each K/V pair
across a group, so the cache stores only `kv_heads` heads:

```text
kv_bytes = 2 (K and V) × layers × tokens × kv_heads × head_dim × bytes
```

A 70B-class model with 64 query heads and 8 KV heads has an 8× smaller cache
than the naive formula predicts. If your estimator scales with the wrong head
count, GQA silently buys you nothing, on paper.

## What to look for

When a formula has two similar-looking variables, generated code picks one
with total confidence. Check which one the *concept* demands.
