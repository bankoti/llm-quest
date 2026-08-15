# 05 - Toolkit Gauntlet

One drill per level, no new concepts. A serving team sizes a deployment,
picks the cheapest hardware, reads an eval table, and routes queries to
experts. You have written every ingredient; this boss checks they compose
under light pressure.

## The four drills

**GPUs needed** (level 1). A model of `model_bytes` must fit on cards of
`gpu_bytes`. Partial GPUs do not exist; round up.

**Cheapest config** (level 2). A dict maps config names to hourly cost.
Return the cheapest name, breaking ties alphabetically. Sorting the names
first, then taking the min by cost, gets both properties in one pass
(Python's `min` and `sorted` are stable: equal keys keep their order).

**Accuracy by model** (level 3). Turn `[(name, [True, False, ...]), ...]`
into `{name: fraction_correct}`. Two contract clauses to read carefully:
`sum` counts `True` values directly, and an empty answer list must produce
`0.0` rather than a `ZeroDivisionError`. Guard first.

**Route queries** (level 4). Queries `Q` of shape `(n, d)`, expert profiles
`K` of shape `(m, d)`. Score with one matmul, argmax along the correct
axis, return a plain list. This is the routing core of every
mixture-of-experts model in Course 2 and beyond.

> **Tip:** `.tolist()` converts NumPy results to plain Python types. Tests
> (and JSON, and APIs) often demand plain ints; leaving NumPy scalars in
> return values is a classic contract miss.

## Why these four

They are the four tool families the nine courses draw from: integer napkin
math, key-based selection over collections, defensive contracts, and
axis-correct array work. Pass this gauntlet and no challenge in the
curriculum will fail you on Python mechanics; from here on, every
difficulty is the actual concept.

## Your challenge

Four functions, one from each level. The finish line message means what it
says.
