# 10 - Product Experiment and Launch Decision

## The system you are shipping

Every level in this course works on the same launch. **Waypoint** is a support
assistant that answers order and product questions from retrieved help
articles. Its retrieval stack came out of Course 5, its eval harness out of
Course 6, its serving layer out of Course 7. Two weeks ago the team swapped
the answer model for a distilled student that costs a tenth as much per query.
Your job in this course is to get that system, cheaper model and all, through
a launch review that would survive an auditor.

The experiment you design here asks the money question: does Waypoint reduce
support contacts without dragging down resolution quality?

## Pre-registration

Pre-register before analyzing outcomes: hypothesis, primary metric, guardrails,
unit, eligibility, expected assignment, minimum detectable effect, power/sample,
duration, ramp, exclusions, analysis, and stop conditions.

Use stable deterministic assignment. Record assignment and actual exposure.
Run instrumentation checks or an A/A test and detect sample-ratio mismatch before
interpreting lift. The challenge below demonstrates assignment and absolute
lift; production analysis needs uncertainty, interference, novelty, and multiple-
testing handling.

> **Note:** the synthetic experiment can validate event joins and decision
> mechanics only. Label results "simulation"; do not infer business conversion.

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
