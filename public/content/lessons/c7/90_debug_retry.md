# Debug: Retry Storm

During the last outage, retries multiplied load instead of shedding it. The
service recovered only when someone turned the retry helper off. One bug.

## The domain

![Linear vs exponential backoff](content/images/c7/retry_backoff.svg)


When a dependency fails, every waiting client becomes a synchronized herd.
Exponential backoff exists to disperse that herd: each attempt doubles the
delay, so pressure decays geometrically:

```text
delay(n) = min(base × 2^(n-1), cap)      # 100, 200, 400, 800, 1600...
```

A linear schedule (`base * n`) *looks* like backoff in a code review (the
delays do grow), but the herd returns at nearly full strength while the
dependency is still on its knees. In production the difference is "blip"
versus "cascading failure".

## What to look for

The docstring says "doubling each attempt". Doubling is a *power*, not a
*multiple*. Check the formula against a hand-computed sequence; writing out
`n=1,2,3` beats staring at the expression.
