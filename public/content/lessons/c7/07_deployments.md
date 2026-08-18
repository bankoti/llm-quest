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

![Progressive deployment stages](content/images/c7/deployment_stages.svg)


1. reproduce artifact and offline gates;
2. deploy dark and run smoke/contract tests;
3. shadow traffic without affecting responses;
4. canary a small eligible population;
5. check sample ratio, quality proxies, errors, saturation, latency, and cost;
6. ramp gradually with automatic and human stop rules;
7. retain previous warm artifact through observation window.

Shadowing tests capacity and compatibility but not user impact. Canary compares
served behavior and must account for traffic mix.

## The canary decision

At every ramp stage the gate makes one of three calls, and the order of checks
is the whole design:

1. **Rollback** on any guardrail breach (error rate or p95 latency), even on
   thin evidence. Demonstrated harm is not something you wait out, and a
   quality gain can never buy back a breach.
2. **Hold** when the sample count is below the evidence bar. Promoting on 120
   requests is opinion; the gate demands data.
3. **Promote** only when the quality delta clears the minimum with enough
   samples behind it.
4. **Hold** otherwise: no harm shown, but no proven win either. A canary that
   never proves its win eventually gets abandoned by a human, not auto-promoted
   by drift.

The asymmetry is deliberate. Rollback triggers on weak evidence of harm;
promote requires strong evidence of good. The cost of a wrong rollback is a
delayed launch; the cost of a wrong promote is an incident at 100% traffic.

## Ramping

A promoted canary does not jump to 100%. It walks fixed stages
(1% -> 5% -> 25% -> 50% -> 100%), re-running the same gate at each stage on
fresh metrics. Hold keeps the current percentage; rollback drops to 0
immediately from any stage. Each stage roughly doubles-to-quintuples exposure,
so a defect that survived 1% gets caught at 5% before it can hurt a quarter of
traffic.

Complete the challenge below: the three-gate `can_promote` check, the
promote/hold/rollback decision, and the ramp walk.

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
