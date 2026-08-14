# 04 - Query Understanding and Hard Constraints

![Hard vs soft query constraints](content/images/c5/query_constraints.svg)


Semantic similarity is not eligibility. For `vegan chicken sandwich`, a meat
chicken sandwich may be semantically close and categorically unacceptable. Parse
the request into a controlled contract:

```text
normalized text: "vegan chicken sandwich"
intent_id: sandwiches
required_attributes: [vegan]
excluded_attributes: []
price_max: null
confidence: 0.97
source: rules | cache | model | user
version: taxonomy + extractor
```

IDs must come from an allowed taxonomy. A model may propose structured output,
but schema parsing is only the first check: validate entity existence, type,
cross-field consistency, permissions, confidence, and size. Unknown values should
abstain rather than enter a filter expression.

## Separate interpretation from retrieval

Keep original query, normalized retrieval query, extracted constraints, and
provenance. Candidate generators use the normalized text; hard filters use
validated IDs. This avoids expanding “dairy free” into prose and hoping vector
similarity enforces it.

Apply immutable legal, safety, tenancy, and availability filters regardless of
route. Business boosts may alter ranking but must not override hard eligibility.
Where possible, filter before expensive reranking; verify that ANN filtering does
not silently reduce candidate recall.

## Ambiguity and clarification

`protein` can mean a product category or a nutritional property. Traffic context,
vertical, and prior interactions may support one interpretation, but confidence
must be calibrated. Product choices include showing facets, blending intents,
asking a clarification question, or using a reversible default.

`QueryInterpreter` demonstrates a cache, controlled vocabulary, and identity
fallback. A production extractor additionally needs a deadline, schema version,
locale handling, audit sample, and adversarial tests.

Complete `workbook/04_constrained_search.py`. Add a meat item with a higher
semantic score and verify the hard vegan constraint still wins.

**Checkpoint:** List every constraint that can affect user safety or contractual
eligibility. Show the non-model enforcement point for each.
