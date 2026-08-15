# 01 - Math Toolbox

A 140 GB model needs how many 80 GB GPUs? If one sample succeeds 30% of the
time, how many tries until failure is under 10%? Every course in this
curriculum eventually reduces to napkin math like this, and Python's `math`
module answers all of it in one line each. This level is the napkin.

## Ceiling division

`140 / 80 = 1.75` GPUs, but you cannot rent 0.75 of a GPU. Sizing questions
always round up:

```python
import math
math.ceil(140 / 80)        # 2
(140 + 80 - 1) // 80       # 2, integer-exact
```

The second form is the classic trick: add `b - 1` before floor-dividing.
It never touches floats, which matters once numbers reach the billions
(bytes, tokens, parameters), where `a / b` can silently lose precision.

> **Tip:** `//` is floor division and `%` is remainder. `7 // 2 == 3` and
> `7 % 2 == 1`. You will meet `//` again in KV-cache block math and
> majority voting (`n // 2 + 1` is "more than half").

## Solving for an exponent

"How many samples n until `0.7**n` drops below 0.1?" Take logarithms:

```python
n = math.ceil(math.log(0.1) / math.log(0.7))   # 7
```

Both logs are negative, so the division comes out positive and the
inequality direction survives. Course 9's test-time compute level uses this
exact line to decide how many times to sample a small model.

## Counting combinations

```python
math.comb(5, 3)   # 10, the number of ways to pick 3 items from 5
```

Exact integer arithmetic, no factorials overflowing. Majority-vote math
(Course 9) sums `math.comb(n, k)` terms.

## Comparing floats

```python
0.1 + 0.2 == 0.3          # False. Really.
math.isclose(0.1 + 0.2, 0.3)   # True
```

Binary floating point cannot represent 0.1 exactly, so equality comparisons
on computed floats are landmines. Every test in this curriculum that checks
a float uses `math.isclose` or NumPy's `np.allclose`. So should your code.

> **Gotcha:** `isclose` uses relative tolerance by default, which fails
> near zero (nothing is "relatively close" to 0.0). Compare against zero
> with `abs(x) < 1e-9` or pass `abs_tol`.

## Your challenge

Four one-liners, used verbatim in later courses: ceiling division, solving
for an exponent, combinations, and float comparison.
