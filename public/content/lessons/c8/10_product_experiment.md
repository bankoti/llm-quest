# 10 - Product Experiment and Launch Decision

Pre-register before analyzing outcomes: hypothesis, primary metric, guardrails,
unit, eligibility, expected assignment, minimum detectable effect, power/sample,
duration, ramp, exclusions, analysis, and stop conditions.

Use stable deterministic assignment. Record assignment and actual exposure.
Run instrumentation checks or an A/A test and detect sample-ratio mismatch before
interpreting lift. The challenge below demonstrates assignment and absolute
lift; production analysis needs uncertainty, interference, novelty, and multiple-
testing handling.

The synthetic experiment can validate event joins and decision mechanics only.
Label results “simulation”; do not infer business conversion.

## Launch review

Assemble product/ADR, data/model cards, frozen quality, judge/calibration audit,
security review, load/cost, failure matrix, telemetry/runbooks, shadow/canary,
rollback, experiment plan, and open risks. For each gate include evidence link,
result, reviewer, date, and expiry.

Choose `launch`, `limited launch`, or `do not launch`. A limited launch specifies
population, duration, missing evidence, and automatic stop. Record dissent and
assumptions. Launch approval expires when critical versions or conditions change.

The Launch Gate level that follows reinforces the same rule as a Boolean
conjunction: quality cannot offset a security or rollback failure.

**Exit gate:** decision follows the predeclared matrix; simulation is not presented
as product proof; all blockers are resolved or launch is explicitly declined.
