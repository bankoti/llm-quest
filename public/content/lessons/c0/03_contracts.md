# 03 - Functions & Contracts

Every challenge in this curriculum is the same deal: a function signature,
a docstring stating exactly what must happen, and a test file that checks
it. That triple is called a contract, and reading contracts precisely is
the actual skill this level teaches. The Python is easy; the precision is
the point.

## Anatomy of a challenge

```python
def safe_ratio(num: float, den: float, default: float = 0.0) -> float:
    """num / den, or default when den is zero."""
    raise NotImplementedError
```

Three things to read before writing anything:

1. **The signature.** `default: float = 0.0` is a default argument: callers
   may omit it. Your implementation must respect it when provided.
2. **The docstring.** "or default when den is zero" is an edge case stated
   as a requirement. Most failed attempts in this course are docstring
   clauses that went unread.
3. **The test.** Tests are `assert` statements. `assert cond, "message"`
   raises with the message when `cond` is false. The Run button executes
   your code, then the test file, in one namespace: green means every
   assert passed.

> **Tip:** when a test fails, the assert message names the case that broke.
> Read it before rereading your code; it usually points at the exact
> docstring clause you skipped.

## Guard clauses

Handle the edge first, then write the happy path with no distractions:

```python
if den == 0:
    return default
return num / den
```

Course 7's serving code is guard clauses all the way down (budget exceeded?
circuit open? queue full?), each one a contract clause made executable.

## Exact string contracts

Some functions return messages, and the test compares strings exactly.
f-strings interpolate values into text:

```python
f"{name}={value} outside [{lo}, {hi}]"
```

Character-for-character means character-for-character: a missing space
fails the test just as surely as a wrong number. Machine-readable output
(Course 4's reports, Course 8's manifests) holds you to the same standard.

## Your challenge

Four small contracts: a clamp, a guarded ratio, a key checker, and an exact
error string. Read each docstring twice; implement once.
