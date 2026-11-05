# Decode and Evaluate Without Moving the Goalposts

Specify stable temperature, nucleus boundaries, EOS behavior, and honest metrics.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-06_lora.

## What You Will Be Able to Do

- Implement stable top-k and nucleus filtering
- Aggregate perplexity correctly
- Separate model quality, decoding policy, and test leakage

## Sampling is a policy over logits

For positive temperature tau, divide logits by tau before stable softmax. A smaller temperature sharpens the distribution; it does not add knowledge. Our decoding_probs applies top-k first (if k is provided), renormalizes, then nucleus filtering. Sort by descending probability, breaking ties by smaller token ID. Keep the smallest prefix whose cumulative mass reaches p, including the crossing token, then renormalize. Require 0<p<=1 and positive temperature.

This order is part of the API. Applying top-p before top-k can yield a different distribution. Greedy decoding is a separate argmax mode, not a division by temperature zero. The generation loop samples using a seeded generator, appends each chosen token, and stops at EOS or a maximum new-token budget. Context cropping must match the architecture's positional assumptions.

## A scoreboard needs a fixed protocol

Model likelihood uses teacher-forced logits before sampling filters. Do not report top-k-renormalized likelihood as the model's perplexity: it changes the distribution and can assign zero probability to legitimate targets. Aggregate NLL sums over valid targets. Compare per-token perplexity only when tokenization and scoring boundaries match; cross-tokenizer comparisons need a common content measure such as bytes with a clearly specified representation.

Task metrics use generated answers. Fix prompts, decoding parameters, seeds, stopping rules, normalization, and verifier before evaluating. Select changes on validation, not the final test set. Report failures as well as successes, and confidence intervals when sample sizes justify them. The tiny capstone demonstrates this discipline, not a public benchmark score or a production quality claim.

## Worked Example: The nucleus includes the crossing token

Sorted probabilities are [0.5,0.3,0.15,0.05], and p=0.7.

1. **Accumulate:** After token 0 the mass is 0.5, below 0.7. After token 1 it is 0.8, enough.
2. **Retain:** Keep tokens 0 and 1, not just token 0.
3. **Renormalize:** The retained distribution is [0.625,0.375,0,0].

Boundary and tie rules matter for reproducibility, especially on small examples.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Explicit top-k then nucleus sampling distribution."""
import numpy as np

def decoding_probs(logits, temperature=1.0, top_k=None, top_p=1.0):
    """Return probabilities in original vocabulary order from finite 1D logits.

Nonempty logits; temperature>0; 0<top_p<=1; top_k None or integer 1..V.
Apply temperature, top-k, normalize, then top-p and normalize again.
Descending ties prefer smaller IDs. Include the nucleus crossing token.
Reject invalid arguments with ValueError; do not mutate logits.
Negative score overflow and exponential underflow yield zero probability."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

A dataset has total natural-log NLL 20 over 10 scored tokens.

- Mean NLL (not perplexity)

<details><summary>Worked answers</summary>

- 2: 20/10=2. Perplexity is exp(2), about 7.389.

</details>

## Experiment

Run `experiments/scratch_training.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Record generated samples at fixed seeds alongside held-out NLL; neither alone is a complete quality assessment.
- Use extreme logits and tied probabilities as numerical tests, not just realistic-looking sentences.

## Transfer Problems

1. Compare top-k then top-p with the reversed order and find a counterexample.
2. Add a maximum-token stopping reason distinct from EOS termination to the generation report.

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

[The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

