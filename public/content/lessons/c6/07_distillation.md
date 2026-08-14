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

The repository uses regression to transparent teacher scores rather than this
full logit formulation. Open `production/distillation.py`: `pair_features`
creates lexical overlap, hashed similarity, and bias; `teacher_score` generates
deterministic weak labels; a tiny MLP learns them.

Complete `workbook/02_distill_student.py`. The expected loss decrease checks
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

**Checkpoint:** Identify one teacher error class that scale would amplify. Add a
human-labeled counterexample set and a launch guardrail for it.
