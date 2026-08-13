# Debug — Flattering Precision

Your laziest retriever — the one that returns a single document — is scoring
100% on the eval an AI assistant wrote. One conceptual bug.

## The domain

Precision@k answers: *of the k results I budgeted for, how many were worth
showing?* The denominator is the budget `k`, not the number of results the
system happened to return:

```text
precision@k = |relevant ∩ top-k retrieved| / k
```

Divide by the returned count instead and you reward systems for returning
less: one relevant doc out of one returned looks perfect, while the user
stares at nine empty slots.

## Why this matters beyond search

This is the canonical metric bug: a denominator that flatters the system under
evaluation. Every eval an AI writes for you deserves this question: *who
controls the denominator, and what behavior does it reward?*
