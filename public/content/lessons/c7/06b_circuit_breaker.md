# 06b - Circuit Breakers

A timeout protects one call. A retry policy protects one request. A circuit
breaker protects the *system*: when a dependency is clearly down, stop asking
it and fail fast to fallback, so you spend your latency budget on answers that
can actually succeed.

## The state machine

![Circuit breaker state machine](content/images/c7/circuit_breaker.svg)

A breaker tracks recent failures for one dependency and moves through three
states:

- **closed** — normal operation. Calls flow. Every failure increments a
  counter; a success resets it. When failures reach the threshold, the breaker
  trips to open.
- **open** — fail fast. `allow()` returns false immediately; callers go
  straight to fallback without paying the timeout. No downstream calls means
  the struggling dependency gets room to recover instead of a retry mob.
- **half-open** — probe. After a cooldown, let a limited number of calls
  through. One success closes the breaker; one failure reopens it and restarts
  the cooldown.

Walk the test sequence by hand before coding:

```text
closed, failures=0  -> record(False) -> closed, failures=1
closed, failures=1  -> record(False) -> open           (threshold=2 reached)
open                -> allow() is False                (fail fast)
open                -> cooldown_elapsed() -> half-open (allow() is True: probe)
half-open           -> record(True)  -> closed, failures=0
half-open           -> record(False) -> open           (probe failed, back off)
```

Two details people get wrong:

1. A success in **closed** state resets the failure count. Without the reset,
   a dependency that fails once an hour eventually trips the breaker even
   though it is 99.9% healthy.
2. Closing from **half-open** must also reset the count, or the very next
   failure re-trips a breaker that just proved the dependency recovered.

## Partition your breakers

One breaker for "the AI service" is a self-inflicted outage: a fault in one
model, one region, or one provider opens the circuit for everything. Partition
breakers by dependency, model, and region so the blast radius of a trip matches
the blast radius of the fault.

## Teaching model vs production

Complete the challenge below. The teaching state machine uses simple counts and
an explicit `cooldown_elapsed()` signal. Production breakers add rolling
windows (failure *rate*, not raw count), wall-clock cooldowns, concurrency
safety, metrics on every transition, and sometimes distributed coordination so
a fleet trips together instead of one host at a time.

**Think it through (ungraded):** your breaker guards a translation model with a
p99 of 800 ms and a 2 s caller deadline. What failure threshold and cooldown
would you pick, and what evidence would change your answer?
