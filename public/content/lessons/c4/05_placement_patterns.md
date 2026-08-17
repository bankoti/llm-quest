# 05 - Choose Where AI Runs

![AI placement spectrum](content/images/c4/placement_spectrum.svg)


Model placement often matters more than model family. Compare patterns against
the measured failure, existing stack, and budgets.

## Offline intelligence, classical runtime

Use a capable model to propose taxonomy links, synonyms, metadata, or query
segments in a batch pipeline. Validate outputs and publish versioned artifacts.
Runtime remains deterministic. This fits stable knowledge and strict latency but
introduces freshness and data-provenance work.

## Validated head cache, deadline-bound tail model

Precompute frequent query interpretations, review or automatically validate them,
and cache by query plus taxonomy/prompt/model version. Route misses to a live
model with schema validation and a hard deadline. This exploits skewed traffic;
coverage, staleness, and invalidation become first-class metrics.

## Shared embedding retrieval

Embed queries and items into one space, retrieve approximate neighbors, then
rerank and filter. This can unify semantic retrieval across language or vertical
boundaries. It adds training pairs, hard-negative mining, vector-index operations,
and embedding/index compatibility requirements.

## Teacher offline, student online

Use a larger model to label or score logged pairs, audit labels, and train a small
encoder or ranker. Only the student serves requests. This converts inference cost
into data and training cost and is useful under tight latency, but the student can
inherit systematic teacher errors.

## Direct live generation

Use when the output must genuinely be synthesized per request and retrieval or a
structured model cannot satisfy the task. Constrain context, output schema,
deadline, tools, and permissions. Generation is not the default endpoint of a
search architecture.

## Decision method

First apply hard gates: privacy, license, hardware, p95, availability, and policy.
Then compare surviving options on quality potential, implementation effort,
freshness, operability, unit cost, and reversibility.

> **Gotcha:** do not let a weighted score compensate for a hard violation.

**Checkpoint:** For each pattern, name its source of truth, online failure mode,
version boundary, and fallback.
## Challenge decision rules

The challenge `choose_pattern` tests three of the patterns above using numeric
thresholds. The mapping and logic:

| Return value | Pattern above | When to use |
|---|---|---|
| `"head-cache"` | Validated head cache | `head_coverage >= 0.5` — majority of traffic is computable ahead of time |
| `"live-model"` | Direct live generation | Coverage too low for a cache; `latency_ms >= 150` — deadline is loose enough for a real-time call |
| `"teacher-student"` | Teacher offline, student online | Low coverage **and** tight deadline — no live call fits; distill offline |

Apply the rules in order: check `head_coverage` first, then `latency_ms`. The
`unlabeled_pairs` argument tells you how much distillation data is available but
does not change the routing decision in this simplified version.
