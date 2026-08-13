# 09 - Non-Inferiority Testing

When you replace a component — a bigger model with a distilled one, an
expensive reranker with a cheaper one — the question is rarely "is the new
one better?" It is "is the new one not meaningfully worse, given that it is
10x cheaper?" That question has a name: non-inferiority.

## Superiority vs. non-inferiority

A superiority test asks whether the challenger beats the incumbent. A
non-inferiority test asks whether the challenger stays within an acceptable
margin of the incumbent:

```text
challenger_metric >= reference_metric - margin
```

The margin is a product decision, not a statistical one. It encodes how much
quality you are willing to trade for the cost, latency, or operational win.
A margin of 0.02 on answer accuracy says: "we accept losing up to 2 points."

## Per-segment checks, not just overall

The most common failure in model swaps is aggregate parity hiding segment
regression. A distilled model can match overall accuracy while collapsing on
the tail: rare intents, minority dialects, safety-critical slices. A real
non-inferiority gate checks every segment you care about:

```text
pass = all(challenger[s] >= reference[s] - margin  for every segment s)
```

One failing segment fails the gate. This is deliberate — the segments were
chosen because each one matters independently.

## Choosing segments and margins

- Include at least: overall, the known-hard tail, and any compliance-relevant
  slice (dietary restrictions, medical, financial).
- Tighter margins for higher-stakes segments are legitimate; a uniform margin
  is the simplest defensible start.
- Zero margin means "must be at least as good" — appropriate when the swap
  has no cost benefit to trade against.

## Your challenge

Implement `passes_noninferiority(student, reference, margin)`: every segment
in the reference must be matched within the margin. One miss fails the gate.
