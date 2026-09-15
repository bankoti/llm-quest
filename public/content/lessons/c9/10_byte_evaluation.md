# Byte Model Evaluation: What Would Count as a Win?

Allow 60-90 minutes. Prerequisites: the conversion lab, negative log-likelihood,
scaling-law experiments, and basic latency measurements. The exercise builds
four small tools that expose mismatched comparisons. The notebook then uses
them on explicitly synthetic observations, not claimed paper results.

## 1. Choose a common denominator

A model predicts units, but the user consumes text. Different tokenizers give
different counts for the same text. Normalize the **sum** of negative
log-likelihoods by raw UTF-8 content bytes:

```text
BPB = sum(NLL in nats) / (content_bytes * ln(2))
```

Four predictions each costing 2 bits and eight predictions each costing 1 bit
both total 8 bits. If the same content is 4 bytes, both have 2 BPB. Averaging
per prediction first would give an incompatible denominator.

For byte-plus-EOT models, include losses for predicted EOT symbols, but do not
count EOT, BOS, or padding as content bytes. This scores the declared augmented
sequence. It is not the raw-text likelihood marginalized over every possible
segmentation. Report the convention instead of silently switching representations.

`bits_per_byte` takes nonnegative finite NLL values and a positive integer byte
count. Empty inputs or fractional counts should fail, not produce a reassuring
number. Document which symbols contributed to the numerator and denominator.

## 2. A likelihood metric is not a quality verdict

Imagine the correct answer has probability 0.4 in two models. In model A, every
other answer has less than 0.4; in model B, one wrong answer has 0.5. The target
loss is identical, but greedy predictions disagree. Task accuracy, output
validity, and critical error slices need direct evaluation.

The tiny training notebook reports representation BPB. It cannot establish
general language ability, reliable reasoning, multilingual quality, or safety.
Use an independently reviewed task set before making a product decision.

## 3. Name an observation, interpolation, or extrapolation

Suppose you trained at compute budgets 10, 20, and 40. A quality result actually
evaluated at 20 is observed. An estimate at 30 is interpolated. An estimate at
100 is extrapolated. A fitted curve may be useful, but it does not create more
trained checkpoints. `evidence_region` labels the compute location only; even a
curve prediction at a sampled budget is still distinct from its measured score.

Before accepting a predicted crossover, inspect the largest measured budget,
fit residuals, held-out fit points, seed variation, and sensitivity to the curve
family and validation set. A fitted asymptote is not a universal upper bound.
Do not treat a ceiling predicted for one experimental setup as a law of bytes.

In the accompanying notebook, leave out the largest observation, fit a simple
curve using only the earlier points, then evaluate the held-out prediction.
Change a single noisy observation and inspect the extrapolated result. This is
a sensitivity demonstration, not a validated scaling law.

## 4. Compute logit payload honestly

Our storage exercise isolates target-logit payloads:

```text
dense_FP32 = positions * vocabulary_size * 4
sparse_top_k = positions * k * (4-byte value + 4-byte index)
```

At 10 prediction positions, a 1,000-entry dense vocabulary costs 40,000 bytes.
Keeping five logits with indices costs 400 bytes. But a byte representation of
the same content may need 45 positions. Its 256-entry dense target then costs
46,080 bytes. A small vocabulary alone is not a guaranteed storage win against
aggressive top-k truncation. Compare both storage and the probability mass lost.

The exercise excludes token IDs, text storage, compression, metadata, and
teacher inference. Real cost accounting must add them. Its numbers are original
teaching examples, not the paper's reported savings.

## 5. Measure equal completed work

`serving_summary` calculates sequential aggregate content throughput:

```text
bytes_per_second = 1000 * sum(completed_content_bytes) / sum(elapsed_ms)
```

Do not average individual request rates. A 10-byte request taking 100 ms and a
90-byte request taking 300 ms complete 100 bytes in 400 ms: 250 bytes/s, not the
unweighted average of their separate rates. For p95, this lab explicitly uses
the nearest-rank sample at `ceil(0.95*n)-1`; a production dashboard may use a
different percentile estimator.

The training notebook times two warmups and five sequential CPU requests for
eight returned ASCII bytes each. It constrains byte outputs to the synthetic
alphabet (plus EOT where applicable), uses no KV cache, and reports incomplete
requests instead of pretending they completed. The generation cap is a safety
bound, not a meaningful production SLO. Five samples are only a smoke test.
Parameter tensor storage excludes activations, KV cache, runtime overhead, and
peak RAM; do not label it process memory.

For a real deployment experiment, record model/checkpoint and tokenizer,
hardware/runtime/precision, prompt length in content bytes, requested output
length, batch and concurrency policy, warmup, at least a justified number of
repetitions, time-to-first-byte, inter-byte latency, end-to-end p50/p95, peak
memory, failures, and quality by task slice. Include teacher-label generation,
student training, and recurring serving costs in a lifetime comparison.

## 6. Make a conditional decision

Write a short evidence memo after the notebook:

1. Which rows are measured, and which depend on a fitted curve?
2. Are content, compute, model capacity, and quality each matched or explicitly
   allowed to differ? Name the controlled axis for every comparison.
3. Which method meets the target quality floor and latency/memory constraints?
4. What result would reverse your recommendation?

The correct answer can be **insufficient evidence**. A method that conserves
teacher probabilities can still lose on end-to-end cost or task quality.

## Worked checks and AI-assisted practice

Hand-calculate the 8-bit/4-byte example and the 100-byte/400-ms example first.
Then implement the four functions and run their grader. The worked solution
follows the same contracts and does not relax invalid-input checks. Ask an AI
assistant to propose counterexamples, but verify them against the declared
units and formulas yourself. Do not accept invented benchmark observations.

**Exit check:** give one reason each that smaller vocabulary, lower BPB, and
higher prediction-units/second can fail to imply a better deployed model.

## Research context

[Breaking the Token Ceiling, sections 7-10 and appendices A/D/G](https://arxiv.org/abs/2609.12303)
is the case study, not a production recommendation. Several headline comparisons
use asymptotic extrapolation; inference-cost parity is not established by the
study. The course keeps those claims separate from both measured checkpoints
and its own synthetic experiments.
