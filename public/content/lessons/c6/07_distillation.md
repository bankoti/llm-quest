# 07 - Teacher-Student Distillation Mechanics

![Teacher-student distillation](content/images/c6/distillation_flow.svg)


Distillation transfers behavior from a teacher to a smaller or cheaper student.
For relevance, the teacher may emit class probabilities, scores, pairwise
preferences, or margins. The student can optimize a mix of hard human labels and
soft teacher targets.

For class logits `z` and temperature `T`:

```text
p_teacher = softmax(z_teacher / T)
p_student = softmax(z_student / T)
L = alpha * L_hard + (1 - alpha) * T^2 * KL(p_teacher || p_student)
```

Feel what temperature does with a two-class example, logits `[2, 0]`:

```text
T=1: softmax([2.0, 0])  = [0.88, 0.12]   near one-hot, little signal in the tail
T=2: softmax([1.0, 0])  = [0.73, 0.27]   the runner-up now carries real signal
T=4: softmax([0.5, 0])  = [0.62, 0.38]
```

Those tail probabilities are the "dark knowledge" the student learns
from: how wrong the wrong answers are. Dividing logits by T also shrinks
gradients by roughly 1/T^2, which is why the soft term is scaled back up
by T^2 — it keeps the soft and hard losses comparable while you tune T.

The repository uses regression to transparent teacher scores rather than this
full logit formulation. Open `production/distillation.py`: `pair_features`
creates lexical overlap, hashed similarity, and bias; `teacher_score` generates
deterministic weak labels; a tiny MLP learns them.

Complete the challenge below. The expected loss decrease checks
optimization only. It does not prove generalization, teacher correctness,
calibration, ranking quality, or latency.

## A valid experiment

Split by query family and time. Train on teacher-labeled pairs, calibrate on a
separate audited split, and evaluate teacher and student against human labels on
the locked set. Include hard negatives and critical constraints. Report:

- NDCG/precision and non-inferiority delta by slice;
- teacher-student agreement and both systems’ human disagreement;
- calibration and abstention coverage;
- p50/p95 throughput and memory at target batch size;
- label, training, and recurring serving cost.

## Student can surpass teacher, carefully stated

A student may outperform its teacher on a target metric because it sees many
teacher-labeled examples plus inductive bias or human labels. That does not make
the teacher labels ground truth. Walmart’s published relevance work is a useful
case study; reproduce the principle on your data rather than generalizing the
reported outcome.

**Think it through (ungraded):** Identify one teacher error class that scale would amplify. Add a
human-labeled counterexample set and a launch guardrail for it.
