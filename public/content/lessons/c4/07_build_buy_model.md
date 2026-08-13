# 07 - Build, Buy, or Adapt

“Which model is best?” is downstream of “which capability and operating boundary
do we need?” Define a task-specific acceptance harness before testing vendors,
open checkpoints, or a custom student.

## Hard gates

Reject an option before scoring if it violates any non-negotiable constraint:

- data may leave allowed regions or be retained for provider training;
- license does not permit the intended use or distribution;
- p95 cannot meet the allocated deadline on target hardware;
- output cannot be constrained or independently validated;
- required language or critical slice misses its quality floor;
- no rollback, export, or version pinning path exists.

Security questionnaires and contract terms are evidence, not runtime controls.
Test network boundaries, logging defaults, deletion, and failure behavior.

## Compare operating models

**Managed API:** fastest access to capable models and elastic capacity; trades
away some control, adds network/vendor dependency, and may create token-based
cost volatility.

**Self-hosted open-weight model:** greater placement and runtime control; requires
inference engineering, capacity planning, patching, license review, and quality
evaluation. Downloadable weights do not make the training data open.

**Adapted or distilled model:** can target a narrow task and SLO; requires a
versioned data/evaluation pipeline and ongoing drift management.

**Classical or rules system:** often strongest for explicit constraints and
stable taxonomies. It remains a serious option, not merely a fallback.

## Weighted scorecard after gates

Weight quality by slice, latency, reliability, privacy, unit cost, operational
fit, and reversibility. Keep raw measurements beside normalized scores. A total
score without uncertainty can hide that two options are statistically tied.

Complete `workbook/04_architecture_scorecard.py`. Its essential behavior is that
a hard-constraint failure removes an option regardless of weighted quality.

## Avoid benchmark substitution

General benchmark rank does not establish quality on your taxonomy, prompt,
output schema, language distribution, quantization, or serving stack. Use public
results to shortlist, then run the frozen harness with exact model, revision,
template, precision, and decoding settings.

**Checkpoint:** Write an exit plan for the selected option: portable data,
evaluation harness, adapter boundary, and maximum switching time.
