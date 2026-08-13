# 12 - Architecture Decision Defense

The final project audits an unfamiliar open checkpoint and recommends whether it
belongs in a concrete system. Architecture facts and product decisions must stay
separate: the same checkpoint can be a sound batch teacher and a poor interactive
runtime.

## Scenario

Choose one workload:

- multilingual query understanding under 80 ms;
- document synthesis with 64K-token inputs and short outputs;
- offline labeling of ten million query-item pairs;
- multimodal support triage with screenshots;
- local generation on a fixed 16 GiB device.

Define a quality metric, p95 latency, throughput, memory, license, privacy, and
cost constraints before choosing the checkpoint.

## Required package

1. **Source dossier:** official report, config, implementation locations,
   checkpoint revision, tokenizer, and license.
2. **Architecture sheet:** objective, information flow, sequence mixer, channel
   mixer, positions, normalization, modalities, and post-training mode.
3. **Resource model:** parameters by subsystem, active parameters, KV or recurrent
   state, expected precision, and communication path.
4. **Miniature:** one distinctive mechanism implemented with shape, gradient,
   causality, and boundary tests.
5. **Ablation:** change one mechanism or ratio while holding the task and budget
   fixed.
6. **Serving sketch:** prefill/decode path, batching, cache, fallback, and hardware
   assumptions.
7. **Decision record:** selected option, rejected alternatives, evidence, risks,
   and conditions that trigger reevaluation.

## Defense questions

- Which observed benefit comes from architecture rather than training data?
- What is total capacity versus active compute?
- Which state grows with input or output length?
- What happens when context, modality count, or batch size doubles?
- Which required kernel exists on the target hardware?
- What can the official artifacts prove, and what remains a vendor claim?
- Could a smaller encoder, retrieval system, or distilled student meet the goal?

## Passing standard

All equations reconcile with config values. Every key claim has a primary source
or executable probe. The miniature’s limitations are explicit. The recommendation
meets the predeclared workload constraints, and at least one cheaper or simpler
alternative is evaluated fairly.

Course 4 begins from this conclusion: choosing an architecture is still too early
until the surrounding product stack, baseline, and failure class are mapped.
