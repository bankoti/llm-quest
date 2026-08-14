# 08 - Risk, Security, and Governance by Design

Risk work starts during architecture, not after model selection. Use the NIST AI
Risk Management Framework and its Generative AI Profile as organizing references,
then map requirements to the actual product and jurisdiction with qualified legal
and security reviewers.

## Identify assets and actors

Assets include user queries, catalog data, embeddings, labels, prompts, model
weights, credentials, logs, business rules, and generated outputs. Actors include
users, suppliers, annotators, operators, model providers, compromised accounts,
and untrusted content authors.

## Threat scenarios, not generic labels

![Risk priority matrix](content/images/c4/risk_matrix.svg)


Write each risk as a causal scenario:

```text
untrusted supplier text contains instructions
-> text enters a model context during enrichment
-> model treats data as authority
-> generated taxonomy metadata bypasses validation
-> unsafe product is linked to a protected query class
```

Now controls have locations: isolate instructions from data, allowlist output
entities, validate against catalog truth, require review for high-impact classes,
store provenance, and block publication on failed checks.

Cover prompt injection, sensitive-data disclosure, insecure tool use, poisoning,
model or dependency supply chain, denial of service, overreliance, and cross-tenant
leakage. Course 7 maps these to the OWASP LLM risk categories and runtime tests.

## Data classification and minimization

Classify each field by sensitivity, purpose, retention, access, location, and
whether it may be used for evaluation or training. Hashing is not anonymization
when values can be guessed. Keep raw production logs out of a tutorial; this
repository uses synthetic fixtures.

## Prioritize and verify

Score likelihood, impact, exposure, and control strength consistently. Scores
prioritize review; they do not prove safety. Every high risk needs an owner,
preventive or detective control, verification method, residual risk decision,
and review date.

Complete `workbook/06_risk_register.py`. Then add one low-likelihood,
high-impact scenario that a simple average would under-prioritize.

**Checkpoint:** Show that the deterministic fallback does not bypass policy
filters. Reliability controls must preserve security invariants.
