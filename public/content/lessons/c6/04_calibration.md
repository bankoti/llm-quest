# 04 - Calibration, Thresholds, and Abstention

A score is calibrated when predictions assigned confidence `p` are correct about
`p` of the time under the evaluated population. Ranking quality and calibration
are distinct: a model can order examples well while its probabilities are
overconfident.

## Reliability diagram and ECE

![Reliability diagram / ECE](content/images/c6/calibration_diagram.svg)


Partition predictions into confidence bins. For bin `B_m`, compare mean
confidence and empirical accuracy:

```text
ECE = sum_m (|B_m| / n) * |accuracy(B_m) - confidence(B_m)|
```

Work one tiny set by hand: 4 predictions, 2 equal-width bins:

```text
confidence: [0.3, 0.4, 0.8, 0.9]     outcome: [0, 1, 1, 1]

bin [0.0, 0.5): members 0.3, 0.4 -> mean conf 0.35, accuracy 1/2 = 0.50, gap 0.15
bin [0.5, 1.0]: members 0.8, 0.9 -> mean conf 0.85, accuracy 2/2 = 1.00, gap 0.15

ECE = (2/4) * 0.15 + (2/4) * 0.15 = 0.15
```

Both bins here are *under*confident, and both gaps count with the same
sign: ECE measures distance from the diagonal, not direction. Direction
is what the reliability plot is for.

Expected calibration error depends on binning and can hide local failures. Also
report Brier score or log loss, reliability plots, and critical-slice behavior.
Complete the challenge below and test a perfectly calibrated toy set and
an overconfident wrong set.

## Fit without leaking

Temperature scaling, Platt scaling, and isotonic regression learn a mapping from
raw scores to probabilities. Fit on a calibration split, choose thresholds on a
validation split, and report once on the locked test. Refit after model, prompt,
class balance, or routing changes.

## Select an operating point

Thresholds encode asymmetric cost. For high-severity false positives, require a
precision floor and let uncertain examples abstain or use the baseline. Report
quality versus coverage:

```text
coverage = answered / eligible
risk     = errors / answered
```

> **Gotcha:** do not call abstained cases correct. Track their outcome
> separately and ensure the fallback remains useful.

## Distribution dependence

Calibration measured on a balanced benchmark may fail under production class
prevalence. Evaluate by traffic-weighted distribution and key slices, and monitor
the confidence/output distribution after launch.

**Think it through (ungraded):** Choose thresholds for ordinary relevance and a dietary constraint.
Explain why they should differ and which labeled data supports each.
