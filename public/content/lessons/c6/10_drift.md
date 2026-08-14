# 10 - Drift and Continuous Evaluation

Production changes even when code does not. Query language, product mix,
inventory, source freshness, traffic routes, and upstream schemas can shift.
Separate:

- **input drift:** feature or query distribution changes;
- **label/concept drift:** the correct mapping changes;
- **prediction drift:** score or route distribution changes;
- **performance drift:** delayed ground-truth quality declines;
- **system drift:** latency, error, cost, or dependency behavior changes.

Population Stability Index (PSI) compares reference and current binned shares:

```text
PSI = sum_i (current_i - reference_i) * ln(current_i / reference_i)
```

It is a heuristic sensitive to bins and sample size, not a universal alarm
threshold. Complete `workbook/06_population_drift.py` and handle zero bins with a
declared epsilon.

## Monitor leading and lagging evidence

![Leading vs lagging drift indicators](content/images/c6/drift_leads_lags.svg)


Leading indicators include locale/intent mix, embedding norms, confidence,
abstention, fallback, candidate overlap, index age, and judge disagreement.
Lagging indicators include audited relevance, complaints, and business outcomes.
Proxies can trigger investigation but should not relabel themselves as quality.

## Continuous evaluation loop

Sample recent traffic under privacy rules, join delayed labels, stratify failures,
run the frozen regression suite and rolling set, compare to release baselines,
then decide whether to repair data, threshold, model, or product flow. Preserve
historical versions and prevent new production data from contaminating the locked
benchmark.

Define alert owner, investigation runbook, retraining trigger, cooldown, and
rollback. Automatic retraining without label and release gates can automate drift
into production.

**Checkpoint:** Create a drift scenario where PSI is high but quality is stable,
and one where PSI is low but a critical rare slice fails. Explain the needed
monitoring layers.
