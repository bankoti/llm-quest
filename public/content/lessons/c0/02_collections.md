# 02 - Collections & Comprehensions

A reranker returns the 5 best documents out of 100. A tuning loop picks the
draft length with the highest speedup. An eval counts how often each label
appears. None of these deserve more than two lines of Python, and the
courses ahead write them in two lines every time. Here are the idioms.

## Sorting by a key

`sorted` takes a `key` function that says what to sort by. To rank indices
by their scores:

```python
scores = [0.3, 0.9, 0.5]
order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
# [1, 2, 0]  ->  top-2 is order[:2]
```

Sorting index positions instead of values keeps the connection to the
original list, which is what retrieval needs: "document 1 is best", not
"0.9 is best". Course 5 (reranking) and Course 6 (NDCG) are built on this
line.

## argmax with a loop

The "index of the best" pattern appears constantly (best draft length, best
expert, best checkpoint). A strict `>` keeps the first maximum on ties:

```python
best = 0
for i, x in enumerate(xs):
    if x > xs[best]:
        best = i
```

`enumerate` hands you `(index, value)` pairs so you never write
`range(len(...))` just to index back in.

> **Note:** NumPy has `np.argmax` for arrays; this level builds the plain
> list version so the array version holds no mystery.

## Counting with a dict

```python
counts = {}
for label in labels:
    counts[label] = counts.get(label, 0) + 1
```

`.get(key, default)` reads "the count so far, or 0 if new". Evaluation
code (Course 6) counts wins, labels, and rater agreements this way.

## Walking two lists together

```python
deltas = [a - b for b, a in zip(before, after)]
```

`zip` pairs elements in lockstep; the comprehension collects results in one
readable expression. Speculative decoding's verify walk (Course 7) is a
`zip` over drafted tokens and random draws.

> **Tip:** comprehensions beat loops when the body is a single expression.
> The moment you need two statements or an early exit, use a plain loop;
> the courses do both, always choosing the more readable one.

## Your challenge

Implement top-k selection, first-tie argmax, dict counting, and pairwise
deltas. Each is a pattern you will recognize in at least two later courses.
