# 02 - Rubrics, Human Labels, and Agreement

Labels operationalize a product judgment. Write the rubric before seeing model
outputs so it does not favor a preferred system. Define relevance grades,
constraint severity, evidence requirements, ambiguity, and abstention.

For graded commerce relevance:

```text
3 = exact intent, eligible, strong match
2 = useful alternative within intent
1 = weak/adjacent match
0 = irrelevant or ineligible
```

A hard safety or dietary violation can be separately flagged rather than hidden
inside grade 0. This lets launch policy treat severity differently from ordinary
ranking error.

## Annotation procedure

Train annotators on examples and counterexamples. Randomize candidate order and
blind model identity. Include gold calibration items and repeated items to detect
drift. Let annotators mark insufficient context rather than force a guess. Record
annotator, rubric version, time, and adjudication.

## Agreement

![Rubric scoring and annotator agreement](content/images/c6/rubric_agreement.svg)


Raw percent agreement is inflated when one label dominates. Cohen’s kappa for two
raters adjusts for chance agreement:

```text
kappa = (observed_agreement - expected_agreement) /
        (1 - expected_agreement)
```

Kappa is sensitive to prevalence and does not prove either rater is correct.
Use confusion matrices and disagreement examples. Weighted kappa or Krippendorff’s
alpha may fit ordinal/multiple-rater settings; choose before analysis.

Complete the challenge below. Then inspect disagreements in high-severity
slices. Adjudication should update either the label or rubric; preserve the
original annotations.

## Label quality gate

Define minimum agreement, maximum unresolved rate, audit sample size, and
escalation.

> **Tip:** re-label after rubric changes rather than silently mixing label
> versions.

**Checkpoint:** Write five boundary examples between grades 1/2 and 2/3. If two
qualified annotators cannot apply the rubric consistently, model evaluation will
not repair it.
