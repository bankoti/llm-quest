# 07 - Test-Time Compute

Ask a model a hard math question once and it scores 30%. Ask the same model
the same question ten times and check the answers against each other, and the
number can pass 90%. No training happened. You bought accuracy with inference
FLOPs, and by 2026 that purchase has its own scaling axis: reasoning models
like DeepSeek-R1 and the o-series are, at their core, machines for spending
test-time compute well.

## The pass@n ceiling

If one sample is correct with probability `p` and you draw `n` independent
samples, the chance that at least one is correct is

```text
pass@n = 1 - (1 - p)^n
```

At p = 0.3: one sample gives 30%, ten give 97.2%. The curve is brutal in your
favor early (each of the first few samples adds a lot) and flat later. This
is a ceiling, though: it assumes something can pick the correct answer out of
the pile. That something is the whole game.

## Verifier-free selection: majority voting

Self-consistency (Wang et al. 2022, arXiv:2203.11171) needs no verifier:
sample n times, take the most common final answer. Under a simple model
(each sample independently correct with probability p, wrong answers never
agree), accuracy is the probability of a correct majority:

```text
maj@n = sum over k > n/2 of C(n, k) * p^k * (1-p)^(n-k)
```

At p = 0.6, five votes lift accuracy to 68.3%. At p = 0.4, the same five
votes drop it to 31.7%.

> **Gotcha:** voting amplifies whichever side of 50% you are on. A model
> that is usually wrong gets more confidently wrong with more samples.
> Repeated sampling only helps when the base model is already better than
> a coin flip on that task, or when a verifier can spot the rare correct
> answer.

## Verifiers and sequential revision

The other two families, briefly:

- **Verifier reranking**: a reward model or a programmatic check (does the
  code pass the tests? does the proof check?) scores each sample and picks
  the best. Where a hard verifier exists, you get close to the pass@n
  ceiling; this is why coding and math fell to reasoning models first.
- **Sequential revision**: instead of n parallel samples, one long chain
  that critiques and revises itself. Modern reasoning models internalize
  this: the "thinking" tokens are test-time compute spent inside a single
  sample, and budget forcing (s1, arXiv:2501.19393) shows even crude
  control of that budget moves accuracy.

## Small model, many samples vs. big model, one sample

Inference costs roughly `2 * params` FLOPs per token. That makes the trade
concrete. Say the target is 90% and an 8B model has single-sample accuracy
p = 0.3:

```text
samples needed: (0.7)^n <= 0.1  ->  n = 7
cost: 7 * 2 * 8B  = 112 GFLOPs/token   vs   one 70B pass: 140 GFLOPs/token
```

Seven shots from the small model beat one shot from a model nine times its
size, and that is before batching the seven samples together. Drop the small
model to p = 0.2 and it needs 11 samples (176 GFLOPs/token): the big model
wins. Snell et al. 2024 (arXiv:2408.03314) map this frontier carefully:
test-time compute beats parameter scaling on easy and medium problems and
loses on the hardest ones, where no amount of resampling finds an answer the
model cannot represent.

> **Note:** this is the same style of argument as Chinchilla (level 1 of
> this course), one level up. Chinchilla balanced parameters against
> training tokens for a fixed training budget; here you balance parameters
> against inference samples for a fixed serving budget. The debug level's
> lesson applies too: a model you serve billions of times should tilt small
> and spend the savings at test time.

## Your challenge

Implement the four primitives: the pass@n ceiling, majority-vote accuracy,
the sample count needed to hit a target, and the small-vs-large cost
decision.
