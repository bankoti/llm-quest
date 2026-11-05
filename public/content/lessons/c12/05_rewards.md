# Attack the Verifier Before Training

Expose reward hacking, missing learning signal, and misleading success metrics.

## Before You Start

Course 12. Entry course: 10. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** rl-04_grpo.

## What You Will Be Able to Do

- Write a bounded arithmetic verifier
- Construct reward/task disagreement cases
- Diagnose group-relative learning failures

## Reward is an implementation of an objective

Suppose the task is to return the sum of two integers. A verifier that searches for the expected digits anywhere in the response rewards nonsense containing every number. A format-only reward can be maximized without solving the problem. KL can constrain how far the policy moves but cannot turn a flawed verifier into a correct one. A small exploit may already lie close to the reference distribution.

Our strict verifier accepts only an optional sign followed by decimal digits, surrounded by whitespace. It rejects prose, multiple answers, exponent notation, oversized strings, and non-integer operands. Parse safely without eval. Correctness is exact integer equality. This is intentionally a narrow task: a production math verifier needs a declared grammar, equivalence rules, resource limits, and adversarial tests.

## When a valid reward still provides no gradient

If all sampled completions fail, all rewards can be zero and GRPO advantages vanish. If all succeed, the same can happen. A larger group may reveal useful variation but costs more samples; it is not a guaranteed cure. Other failures include a bugged mask, stale rollout probabilities, excessive clipping, a dominating KL coefficient, reward leakage, and near-deterministic exploration.

Evaluate the policy against a separately defined task metric and held-out problems, not only the optimized reward. Track disagreement cases, invalid-output rate, reward variance, group sizes, sampled-token budget, and latency. For reasoning models, terminal correctness does not automatically validate every intermediate explanation. Compare methods at matched resources and report the trade-off, not a winner selected from one favorable seed.

## Worked Example: A verifier exploit

The expected answer is 12. A weak verifier accepts any string containing "12".

1. **Attack:** "0 1 2 3 ... 12 ... 99" passes the substring check without solving the problem.
2. **Narrow the contract:** Require one signed decimal integer and exact equality to the independently computed target.
3. **Keep limits:** Reject enormous strings before parsing. Do not execute model-generated code to calculate the answer.

A higher optimized reward can coexist with unchanged or worse real task performance.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""A narrow, bounded exact arithmetic reward. Never evaluate generated code."""
import re

def addition_reward(response, a, b):
    """Return 1.0 only for a single correct signed decimal integer, else 0.0.

response must be str of <=128 characters before stripping. Operands must
be Python ints, not bools, with abs(value)<=10^9. Invalid operands: ValueError.
Allow surrounding whitespace and leading zeros; grammar [+-]?[0-9]+.
Invalid/non-string/oversized responses get zero, not an exception."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A group has rewards [0,0,0,0].

- Number of nonzero centered advantages

<details><summary>Worked answers</summary>

- 0: Every reward equals its mean. There is no relative task signal.

</details>

## Experiment

Run `experiments/rl_group_updates.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- The experiment includes all-equal groups and a deliberately flawed reward; inspect reward/task disagreement.
- A verifier unit test is necessary, but coverage of tests does not prove the absence of all exploits.

## Transfer Problems

1. Add multiplication with a bounded integer range and adversarial formatting tests.
2. Design a process-reward audit that does not infer reasoning validity from final-answer correctness.

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

[Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.
