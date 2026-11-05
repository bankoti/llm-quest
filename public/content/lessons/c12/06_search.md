# Policy, Value, and Search

Combine learned priors with visit counts and values in a small planning problem.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** rl-05_rewards.

## What You Will Be Able to Do

- Compute PUCT exploration scores
- Back up values consistently
- Distinguish model-based search from model-free policy learning

## A policy narrows choices; a value estimates consequences

In a large branching game, exhaustive search grows roughly as branching_factor^depth. A policy prior can concentrate search on promising moves; a value estimate can score nonterminal states without rolling every path to the end. AlphaGo combined supervised and reinforcement-trained policies, value estimation, and tree search. A prior is guidance, not proof that a move is best.

Our PUCT-style score for action a is Q(a)+c*P(a)*sqrt(1+sum_b N(b))/(1+N(a)). Q is a mean value from the current player's perspective, P is a normalized prior, N is a visit count. The lab uses this explicit teaching convention; variants differ in initialization and exploration constants. Convert visit counts to floating point before adding one or summing, so fixed-width integer counters do not wrap during score arithmetic. Form P*sqrt(1+sum(N))/(1+N) before multiplying by the exploration coefficient, so a large coefficient does not overflow a numerator whose final bonus is finite. Reject nonfinite computed float64 scores with FloatingPointError before selection; bonuses that underflow to zero remain zero before coefficient scaling. In alternating zero-sum games, flip the sign when backing a leaf value through each turn. In single-agent planning, no player-sign flip is needed.

## Search needs a model or executable transition rule

Model-free policy gradients learn from sampled transitions without predicting the next state. Search simulates candidate futures using known game rules or a learned world model. A learned dynamics model can be wrong, and planning can exploit its errors. The next track studies that failure in action-conditioned latent models. A neural policy being called a model does not make its training model-based RL.

The notebook runs a tiny finite tree with exact terminal rewards and misleading priors. Increasing visits can correct a prior, but compute is finite and inaccurate values can mislead. The browser challenge implements selection and signed backup; the experiment traces visit allocations. It is a mechanism study, not a Go engine or an AlphaGo reproduction. For text, branching can represent candidate continuations, but verifier quality and search cost must be included in the comparison.

## Worked Example: One exploration score

Q=.2, P=.5, N(action)=1, total visits=8, c=2.

1. **Exploration:** 2*.5*sqrt(1+8)/(1+1)=1.5.
2. **Score:** PUCT score=.2+1.5=1.7.
3. **After visits:** As this action's visit count grows, its exploration bonus shrinks unless the parent count also grows.

Search allocates computation using both estimated value and uncertainty-oriented exploration.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""PUCT-style selection and perspective-aware value backup."""
import numpy as np

def puct_select(priors, values, visits, exploration=1.0):
    """Return first argmax of Q+c*P*sqrt(1+sum(N))/(1+N).

Valid finite matching 1D arrays assumed: priors>=0 sum=1, visits>=0,
exploration>=0. values are action mean values in the parent's perspective.
Convert priors, values, and visits to floating point before score arithmetic.
Normalize each exploration bonus by visits before multiplying by exploration.
Nonfinite computed float64 scores raise FloatingPointError before selection;
underflowed bonuses are zero before coefficient scaling."""
    raise NotImplementedError('Implement this function, then run the checks.')

def backup_values(leaf_value, edges, alternating=True):
    """Return values at nodes root..leaf for a path with `edges` edges.

leaf_value is in the leaf player's perspective. Flip once per edge for
alternating zero-sum play; keep the value for single-agent planning.
edges nonnegative integer, leaf_value finite; valid inputs assumed."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A game tree has branching factor 4 and depth 5, ignoring early terminal states.

- Leaf paths in exhaustive search

### Worked Answers

- 1024: 4^5=1024.

## Experiment

Run `experiments/rl_search.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Compare fixed visit budgets and record actual terminal outcomes, not only prior probabilities.
- The toy uses exact dynamics; learned-world-model uncertainty is a separate experiment.

## Transfer Problems

1. Replace the value estimates with biased values and measure the extra search needed.
2. Design an equal-token-budget comparison between one long reasoning trace and several searched candidates.

For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.

## AI-Assisted Coding Route

1. Predict the worked example and one edge case without assistance.
2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.
3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.
4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.
5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.
6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.

## Completion Evidence

A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.

## Primary Source

[Mastering Go with Deep Neural Networks and Tree Search](https://www.nature.com/articles/nature16961). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
