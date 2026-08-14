# Debug: The Budget That Forgot Inference

## What you will find

A training budget calculator determines the compute-optimal model size using
the Chinchilla formula. It follows the math exactly. A reviewer approves it.
The team trains the model.

Months later they discover the model is too large to serve at their target
latency. The formula was applied correctly but to the wrong objective.

## The bug is not arithmetic

The challenge below contains a `TrainingBudget` class. Run it on a realistic
scenario and examine its recommendations. They follow the scaling law math.

The bug is an assumption embedded in what the function optimizes:

- What constraint is the formula minimizing?
- What constraint is absent from the calculation?
- For the given scenario, what recommendation would a correct version produce?

The Chinchilla optimum minimizes training compute for a target loss. Inference
cost is not in that objective.

## Exit check

State the missing constraint. Rewrite the function signature to require the
caller to provide it explicitly, and explain how the recommendation changes
for a high-traffic inference workload.
