# Debug: The Generous Judge

Model A wins every pairwise eval. It ships. Users notice nothing. The
aggregator an AI assistant wrote has one conceptual bug.

## The domain

![Counting ties as wins](content/images/c6/debug_winrate.svg)


Pairwise LLM-as-judge evals produce three outcomes: A wins, B wins, tie. The
standard aggregation scores a tie as half a win for each side:

```text
win_rate(A) = (wins_A + 0.5 × ties) / total
```

Count ties as wins for A and a judge that cannot tell the models apart
reports A winning 100% of the time. That is not a small bias; it is the
difference between "ship it" and "there is no effect".

## What to look for

`j != 'B'` reads like "A won or it was close enough". Enumerate the cases:
three outcomes, and the code sorts them into two buckets. Whenever generated
code collapses a three-way outcome into a boolean, ask which side got the
benefit of the collapse.
