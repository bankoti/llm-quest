# The Bitter Lesson: Search, Learning, and Structure

Build a phone-level search graph and test the trade-off between hand structure and scalable learning.

## Before You Start

Course 11. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** dynamics-05_interpolation.

## What You Will Be Able to Do

- Expand a word grammar into phone sequences
- Distinguish constraints from learned probabilities
- Evaluate historical claims with resource-aware evidence

## What a hand-built grammar buys

A constrained speech system can enumerate allowed word sequences and expand each word through a pronunciation dictionary into phones. This narrows the search space and can perform well in its intended domain. Our original toy grammar has choices at each phrase slot and a dictionary from words to phone lists. The coding lab enumerates valid sentences and their phone sequences, deduplicating identical outputs without inventing unsupported pronunciations.

HARPY is a historical example of integrated search with substantial language and pronunciation structure. A hidden Markov model instead gives a probabilistic sequence model with hidden states, transition probabilities, and observation likelihoods. A phone graph is not automatically an HMM: it needs probabilities and a defined emission model. Viterbi finds the highest-probability hidden-state path using dynamic programming; it does not enumerate every path independently.

## The lesson is a research strategy, not a ban on engineering

Sutton's Bitter Lesson argues that methods exploiting computation through search and learning have repeatedly overtaken systems dominated by manually encoded domain knowledge. This is a historical argument about scalable approaches, not a theorem that the largest model always wins under a fixed latency, data, safety, or energy budget. Useful inductive biases and reliable interfaces can coexist with general-purpose learning.

Imitation learning reproduces behavior available in demonstrations; it does not by itself optimize outcomes beyond that data distribution. Search can improve decisions given a useful model or evaluator. AlphaGo combined policy guidance, value estimates, and tree search, with both imitation and reinforcement learning. The RL continuation implements a small policy/value search exercise, while this unit makes the constraints and computational costs explicit. For discussion prompts, state a claim, cite primary evidence, identify a counterexample, and propose a falsifiable comparison.

## Worked Example: A tiny phrase grammar

Slots are ["turn", "move"] then ["left", "right"].

1. **Enumerate:** The Cartesian product gives four valid word sequences.
2. **Expand:** If turn -> [T,ER,N] and left -> [L,EH,F,T], turn left becomes [T,ER,N,L,EH,F,T]. Word boundaries should remain metadata if needed.
3. **Scale:** With 10 independent slots of 5 choices, naive enumeration gives 5^10=9,765,625 sentences. A shared graph can reuse prefixes; unrestricted language still changes the problem.

Representational structure, search algorithm, learned scores, and compute budget are separate design choices.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Original grammar expansion and a tiny log-domain HMM decoder."""
from itertools import product
import numpy as np

def phone_sequences(slots, lexicon):
    """Return sorted unique tuples of phones from a Cartesian word-slot grammar.

slots: list[list[str]], lexicon: dict[str,list[str]]. Preserve phone order.
Empty grammar produces [()]. An empty slot produces no sequences.
Missing word pronunciation: ValueError. No mutation."""
    raise NotImplementedError('Implement this function, then run the checks.')

def viterbi(log_initial, log_transition, log_emission):
    """Return (state path, best log score) for a small HMM.

Initial [S], transition [S,S] indexed previous,next, emission [T,S].
T,S>=1; finite or -inf log scores, valid shapes assumed. First-ID tie break.
Include emission at t=0; backtrack globally, not greedy per-step choices."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Four independent slots each offer three word choices.

- Possible word sequences before deduplication

<details><summary>Worked answers</summary>

- 81: 3^4=81.

</details>

## Experiment

Run `experiments/dynamics_search.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Count the exact search space and compare prefix sharing with naive enumeration.
- The toy graph illustrates a mechanism; it does not reproduce HARPY acoustic recognition or its historical benchmark.

## Transfer Problems

1. Add pronunciation alternatives and explain the new branching factor.
2. Design a fixed-compute comparison between hand constraints, learned scoring, and search.

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

[Richard Sutton: The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [Lowerre: HARPY thesis abstract](https://www.csd.cs.cmu.edu/academics/doctoral/degrees-conferred/bruce-lowerre)
