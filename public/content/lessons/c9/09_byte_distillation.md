# Beyond BPE: Distilling a Byte Student

Allow 90-120 minutes plus the notebook experiment. Prerequisites: byte/BPE
tokenization, stable softmax, conditional probability, causal attention, and
teacher-student training. Refresh **Bytes, Tokens, and Boundaries** and
**Distillation Across Tokenizations** in the interactive track first.

By the end, you should be able to convert a teacher distribution, identify an
approximation at token boundaries, verify exact path probabilities, and train
a small student without confusing a correct target with a successful model.

## 1. Start with the mismatch

A token teacher may choose among `a`, `ab`, `ac`, and `b`. A byte student chooses
among byte values 0-255. The teacher's second logit is not the student's second
logit: their output coordinates mean different things. Distillation requires
targets in the student's output space before applying a loss.

A byte is not a character. `"e".encode("utf-8")` has one byte, while
`"\u00e9".encode("utf-8")` has two. A tokenizer entry can even be only a
fragment of a multibyte encoding. Operate on `bytes`; do not decode each token
separately, drop invalid fragments, or count characters instead of bytes.

For the exercise, vocabulary entries are unique, nonempty byte strings. We do
not model document special tokens. EOT is symbol **256**, outside the byte
alphabet, and means the end of a teacher token. EOS would mean something else.
Teacher boundaries remain part of the augmented representation.

## 2. Work the conversion by hand

Our example teacher has these probabilities:

| Token | Probability |
|---|---:|
| `a` | 0.10 |
| `ab` | 0.40 |
| `ac` | 0.30 |
| `b` | 0.20 |

Before any byte is observed, next-byte probability is `P(a)=0.8`, `P(b)=0.2`.
Now condition on prefix `a`. The matching teacher mass is 0.8, including the
complete token `a`, not just longer tokens.

**Discarding completed tokens:** only `ab` and `ac` remain. Normalize mass 0.7:
`P(b)=4/7`, `P(c)=3/7`. This distribution sums to one but has dropped a branch.
To follow that missing branch as raw bytes, we would need the teacher's next
token distribution after the completed token, which is not in this logit row.

**Keeping an explicit boundary:** assign the complete token's mass to EOT:
`P(b)=0.5`, `P(c)=0.375`, `P(EOT)=0.125`. Now the total is still one, but no
matching branch vanished. At prefix `ab`, EOT has probability one.

The complete augmented path for token `ab` has probability
`P(a) * P(b | a) * P(EOT | ab) = 0.8 * 0.5 * 1 = 0.4`.
For token `a`, the path is `0.8 * 0.125 = 0.1`. Omitting the terminating EOT
would incorrectly report 0.8 for that shorter token.

This telescoping product is the central invariant. Repeat it for every token,
not only the token chosen by the teacher. It proves conversion on the declared
unique-token vocabulary; it does not prove a learned student matches it.

## 3. Implement a stable conditional target

`byte_targets(logits, vocabulary, prefix, use_eot)` does four jobs:

1. Find byte strings starting with `prefix`.
2. Determine the next symbol: the next byte, or EOT for a completed match.
3. Normalize eligible logits using a subtracted maximum.
4. Sum the normalized mass of entries that share that next symbol.

Why normalize **after** selecting? Consider logits `[10000, 0, 0]` for
`[a, bx, by]`, conditioned on `b`. A global softmax may round both eligible
probabilities to zero. Conditional logits `[0,0]` instead give `x=y=0.5`.

`-inf` denotes zero teacher mass and is allowed. Reject NaN, positive infinity,
bad shapes, duplicate/empty tokens, and unsupported prefixes. Without EOT,
prefix `ab` in our example has no continuation; returning a uniform byte
distribution would invent knowledge. Raise `ValueError` instead.

The reference uses a linear scan and `bincount` for clarity. A large production
vocabulary benefits from prefix indexing and batched conversion. This exercise
does not claim that scanning every token for every position is scalable.

## 4. Train with soft distributions

For teacher target p and student distribution q at one position:

```text
KL(p || q) = sum_b p[b] * (log(p[b]) - log(q[b]))
```

Use temperature 1 here. Compute `log(q)` directly with stable log-softmax.
Zero p terms contribute zero; `0 * log(0)` must not create NaNs. Average over
valid positions, not over vocabulary coordinates. Padding does not contribute.
Predicted EOT symbols do contribute in the augmented representation.

The teacher entropy term is constant with respect to student weights. Thus
soft cross-entropy and forward KL have the same student gradient, but different
reported loss values. Do not compare those raw losses as if they were one metric.

`distillation_kl` grades the numerical objective. The notebook uses PyTorch
autograd to update real parameters and evaluates a separate held-out split.

## 5. Run the controlled notebook

The notebook contains this lesson, starter, exact grader, worked reference,
and a complete CPU experiment. Implement the starter before running its grader;
the untouched starter must fail. The reference cell deliberately replaces your
functions only when run. Compare explanations as well as outputs.

The experiment trains a small token teacher on synthetic segmented strings,
then trains four smaller student arms for each of two initialization seeds:

| Representation | Objective |
|---|---|
| Bytes | Supervised cross-entropy |
| Bytes | Approximate converted-target distillation |
| Bytes + EOT | Supervised cross-entropy |
| Bytes + EOT | Boundary-preserving distillation |

The synthetic segmentation is declared, not learned BPE. Train and validation
sets have disjoint raw byte strings, although they share a simple generating
rule. That is a narrow generalization test, not a natural-language benchmark.
Both supervised arms matter: they separate adding boundary information from
adding soft teacher targets. The teacher is fixed across student arms.

The schedule uses the same raw training examples in the same order. EOT adds
positions, so this is **fixed data, not fixed compute**. Record raw content bytes,
prediction units, parameter counts, training time, and the labeled `6NU` work
proxy. This proxy omits important attention and vocabulary effects and is not a
hardware FLOP measurement. Teacher training and target conversion are separate
costs, not free operations hidden in the student timing.

For an extension, hold an estimated work budget fixed by reducing the EOT arm's
steps. This changes data exposure. Explain which variable is now controlled and
which is allowed to change; keep both experiments rather than comparing them
under one ambiguous label.

## 6. Interpret failures and solutions

- Output sums to one but path tests fail: look for a lost terminal branch.
- Rare-prefix test fails: condition before exponentiation.
- KL is NaN: inspect zero targets and log-softmax.
- Lower training loss but worse held-out behavior: inspect overfitting, target
  quality, and objective differences; do not assume conversion is at fault.
- More units/second but slower requests: compare the same amount of raw content.

For AI-assisted coding, write the four-token example and one failing invariant
yourself. Ask the assistant for a single function, run the grader, then explain
each failure before requesting another edit. Deliberately remove EOT once and
predict which checks break. Do not let the assistant rewrite the grader to accept
its implementation. The worked solution is a comparison point, not a substitute
for reconstructing the calculation.

**Exit check:** reconstruct all four token probabilities, explain why EOT is
not EOS, and defend which experimental comparisons are actually controlled.

## Research context

[Marathe et al., Breaking the Token Ceiling (2026), sections 2 and F](https://arxiv.org/abs/2609.12303)
introduces Marginalize-It and End-Of-Token conversion in a large-scale study.
Our examples, datasets, and CPU training experiment are teaching constructions,
not a reproduction of the paper. Continue with **Does the Byte Student Actually
Win?** before interpreting scaling or deployment claims.
