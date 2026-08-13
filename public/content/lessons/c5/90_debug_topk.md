# Debug — Backwards Ranking

Users say results are "weirdly, consistently terrible". Hold that phrase:
consistently. Random bugs produce random badness. Systematic badness means the
system is working perfectly — toward the wrong objective.

## The domain

`np.argsort` sorts **ascending**. It is the single most common footgun in
retrieval code, because taking `[:k]` from an ascending sort hands you the k
*worst* documents with complete confidence. The idiomatic fixes:

```python
np.argsort(scores)[::-1][:k]       # reverse, then take k
np.argsort(-scores)[:k]           # negate, sort, take k
```

## The transferable lesson

"Consistently terrible" is one of the most diagnostic phrases in production
ML. Anti-correlated output means a sign flip, a reversed sort, or a swapped
label — a one-character conceptual bug. Learn the signature and you will find
these in minutes instead of days.
