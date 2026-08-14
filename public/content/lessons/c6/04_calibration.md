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

Expected calibration error depends on binning and can hide local failures. Also
report Brier score or log loss, reliability plots, and critical-slice behavior.
Complete `workbook/03_calibration.py` and test a perfectly calibrated toy set and
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

Do not call abstained cases correct. Track their outcome separately and ensure the
fallback remains useful.

## Distribution dependence

Calibration measured on a balanced benchmark may fail under production class
prevalence. Evaluate by traffic-weighted distribution and key slices, and monitor
the confidence/output distribution after launch.

**Checkpoint:** Choose thresholds for ordinary relevance and a dietary constraint.
Explain why they should differ and which labeled data supports each.
