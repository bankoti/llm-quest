# Debug: Leaky Attention

New level type. You are not writing code from scratch: an AI assistant already
wrote it. It runs, it returns plausible numbers, and it is wrong in exactly one
conceptual way. Your job is the one AI cannot do for itself: judge it.

## Why this skill

In an AI-assisted team the scarce work is review. Generated code fails in a
particular way: it is syntactically perfect, idiomatically confident, and
occasionally wrong about the *concept*. Nobody catches that with a linter.

## The domain

![Effect of masking with 0 vs -inf](content/images/c1/debug_mask_zero.svg)


Causal attention makes one promise: position `t` may use positions `0..t` and
nothing else. The mask is how that promise is kept. Before you read the code,
answer for yourself:

- At what point in the computation must a future position be removed?
- What value, added or substituted *before* softmax, makes a position
  contribute exactly zero weight *after* softmax?
- What does substituting `0` before softmax do instead? (`exp(0) = 1`.)

## How to work

Run it first. Read the failure message; it tells you what property broke, not
where. Form a hypothesis, fix the one line, run again. Asking an AI is fair
game here too; describing the symptom precisely enough to get the right answer
IS the exercise.
