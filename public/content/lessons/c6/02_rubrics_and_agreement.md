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

By hand, two raters, 10 items, labels {relevant, not}:

```text
               rater B: rel   not
rater A: rel            4     1
         not            1     4

observed agreement  p_o = (4 + 4) / 10 = 0.80
marginals: each rater says "rel" 5/10 and "not" 5/10
chance agreement    p_e = 0.5*0.5 + 0.5*0.5 = 0.50
kappa = (0.80 - 0.50) / (1 - 0.50) = 0.60
```

Now skew the prevalence: both raters say "relevant" 9 times out of 10
and agree on 8 items. Raw agreement is still 0.80, but chance agreement
jumps to `p_e = 0.9*0.9 + 0.1*0.1 = 0.82`, so kappa = (0.80 - 0.82) /
(1 - 0.82) = -0.11. Same raw agreement, opposite verdict. That is
exactly why percent agreement is inflated when one label dominates.

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

**Think it through (ungraded):** Write five boundary examples between grades 1/2 and 2/3. If two
qualified annotators cannot apply the rubric consistently, model evaluation will
not repair it.
