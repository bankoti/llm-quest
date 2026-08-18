# 05 - LLM-as-Judge Evaluation

An LLM judge can scale rubric application, pairwise comparison, and error
categorization, but it is another measurement instrument. It is not ground truth.
Record judge model and revision, prompt, rubric, candidate formatting, order,
decoding settings, retries, parser, and cost.

## Known bias probes

![LLM judge known biases](content/images/c6/llm_judge_biases.svg)


Research has documented position bias in pairwise judging and self-preference
when models evaluate related outputs. Other concerns include verbosity/style
preference, sensitivity to prompt framing, contamination, and correlated errors.
Audit the exact judge rather than assuming a paper’s rate transfers.

For pairwise comparisons, run both orders:

```text
judge(A, B) -> winner_1
judge(B, A) -> winner_2 after mapping positions back to systems
```

Consistent decisions survive the swap. Inconsistent rows should be ties,
escalations, or separately analyzed, not arbitrarily counted. The challenge
below implements exactly this audit.

## Validate against humans

Create a blinded human-labeled audit set stratified by task, quality difference,
length, language, and severity. Report agreement, judge confusion matrix,
position-swap consistency, parse failure, and cost. Inspect false positives where
the judge approves an unsupported or unsafe answer.

Use deterministic or executable graders when the task permits: unit tests, SQL
result comparison, exact schema validation, or reference calculations. Use an LLM
judge for dimensions that truly need semantic judgment and preserve human
escalation.

## Avoid judge overfitting

If prompts or models are tuned repeatedly against one judge, they may learn the
judge’s preferences rather than user value. Hold out a judge-audit set, rotate
human review, and evaluate critical dimensions independently.

**Think it through (ungraded):** Draft a judge card stating intended use, forbidden use, validated
population, agreement, biases tested, failure handling, and revision date.
