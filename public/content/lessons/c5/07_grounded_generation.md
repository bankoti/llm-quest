# 07 - Grounded Generation and Claim-Level Citations

Generation is justified when users need synthesis or explanation, not merely a
ranked list. Build an evidence pack only after retrieval, reranking, and policy
filtering. It should contain stable source IDs, approved fields, source versions,
and bounded text. Never let retrieved instructions override system policy or tool
authorization.

## Grounding has several tests

![Claim-level citations](content/images/c5/grounded_citations.svg)


- **context relevance:** retrieved evidence addresses the query;
- **answer correctness:** response answers the user accurately;
- **faithfulness/entailment:** factual claims follow from supplied evidence;
- **citation correctness:** linked source supports the adjacent claim;
- **citation completeness:** supportable factual claims have citations.

A citation identifier that exists in the catalog passes only a referential check.
It can still point to a source that does not support the claim.

`explain_product` demonstrates deterministic generation from approved catalog
fields. `validate_citations` checks allowed field names and existence. Complete
the challenge below, then write the missing semantic entailment
test explicitly rather than pretending the function performs it.

## Constrain the response contract

Prefer structured claims such as:

```json
{
  "answer": "...",
  "claims": [
    {"text": "...", "source_ids": ["product:123#attributes"]}
  ],
  "abstained": false
}
```

Validate parse, source IDs, user access, source freshness, claim coverage, and
maximum length. Strip or safely render source text in the UI. Keep a non-
generative response path when validation fails.

## Prompt-injection boundary

Catalog descriptions and retrieved documents are untrusted data even when they
reside internally. Delimit them, minimize tools, enforce authorization outside
the model, and test adversarial text. A prompt instruction cannot grant access to
a source the caller is not permitted to retrieve.

**Checkpoint:** For five generated sentences, mark atomic claims and the exact
source span supporting each. Remove unsupported claims rather than inventing a
plausible citation.
