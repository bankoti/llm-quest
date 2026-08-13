# 07 - Version Contracts and Reversible Deployment

An AI response depends on more than model weights. Track compatible versions for
API schema, tokenizer, prompt, model/adapters, quantization, runtime, taxonomy,
embedding model, index, reranker, policy, feature flags, and data snapshot.

## Compatibility matrix

Define which versions can coexist. An embedding index usually requires one exact
encoder/preprocessing version. A prompt expects a parser/schema version. Cache
keys include every artifact that can change semantic output. A response exposes
safe version identifiers for incident correlation.

## Deployment stages

1. reproduce artifact and offline gates;
2. deploy dark and run smoke/contract tests;
3. shadow traffic without affecting responses;
4. canary a small eligible population;
5. check sample ratio, quality proxies, errors, saturation, latency, and cost;
6. ramp gradually with automatic and human stop rules;
7. retain previous warm artifact through observation window.

Shadowing tests capacity and compatibility but not user impact. Canary compares
served behavior and must account for traffic mix. Complete
`workbook/06_canary_gate.py`: a quality gain cannot compensate for an error-rate
or latency guardrail breach.

## Data and index release

Build immutable indexes, validate counts/recall/policy/freshness, and switch an
alias atomically. Keep the previous index available. Coordinate model and index
changes or deploy one at a time to preserve attribution.

## Rollback and kill switch

A kill switch bypasses optional AI via control plane without new code. Rollback
restores a known-compatible artifact set and invalidates incompatible caches.
Test it under load. Database or schema migrations need backward compatibility;
weight rollback alone may not restore behavior.

**Checkpoint:** Write a release manifest and perform a simulated rollback. Prove
which requests used each version before and after the switch.
