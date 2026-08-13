# 03 - Latency Budgets and Token Deadlines

Every request arrives with an implicit deadline. A chat user tolerates a few
seconds; a voice assistant tolerates a few hundred milliseconds; an
autocomplete widget tolerates less. Serving systems that ignore deadlines
waste compute on responses nobody will read.

## The budget decomposition

Time to a useful response splits into stages:

```text
total = queue_wait + prefill + (tokens x ms_per_token) + network
```

Prefill cost grows with prompt length; decode cost grows with output length.
Given a deadline and the elapsed time already spent, the remaining budget
determines how many output tokens you can still afford:

```text
tokens_affordable = floor((deadline - elapsed - prefill) / ms_per_token)
```

If the result is zero or negative, generating anything is wasted work.

## Admission by usefulness

A response that gets cut off mid-sentence can be worse than no response:
the user waited and still got nothing usable. Before starting generation,
check whether the affordable token count clears a minimum usefulness bar:

- A summary needs enough tokens to complete at least one sentence.
- A code suggestion needs enough to close the expression.
- A classification label may need only a handful.

If `tokens_affordable < min_useful_tokens`, decline early and fall back:
serve a cached answer, a smaller model, or an honest "try again" signal.
Declining early frees capacity for requests that can still succeed.

## Why this matters at scale

Under load, queue waits grow and every queued request's remaining budget
shrinks. Systems that admit everything enter a death spiral: work is done
on requests that time out anyway, which grows the queue further. Deadline-
aware admission is the difference between graceful degradation and collapse.

## Your challenge

Implement the two primitives that make deadline-aware serving possible:
`tokens_in_budget` computes how many tokens fit in the remaining time, and
`should_start` decides whether generation is worth starting at all.
