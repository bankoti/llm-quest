# 11 - Artifact Manifests and Reproducibility

An LLM system's behavior is determined by more than its weights. The model,
the tokenizer, the retrieval index, the prompt templates, the reranker, the
safety filters — change any one and the system's outputs change. If you
cannot say exactly which versions were live at a given moment, you cannot
debug an incident, reproduce an evaluation, or roll back safely.

## The manifest

![Artifact manifest fields](content/images/c8/artifact_manifest.svg)


A manifest is a complete list of every artifact in the serving path, each
pinned by a content digest:

```text
{
  "model":  "sha256:8f3a...",
  "index":  "sha256:2c9b...",
  "prompts": "sha256:77d1...",
  "filters": "sha256:a04e..."
}
```

Content digests (not version labels) are the key: a label like `v2.1` can be
re-pointed; a SHA-256 of the bytes cannot lie.

## The manifest digest

To compare two deployments at a glance, hash the manifest itself into one
digest. Two properties are non-negotiable:

- **Order independence.** `{model, index}` and `{index, model}` describe the
  same system, so they must produce the same digest. Sort the entries before
  hashing.
- **Sensitivity.** Changing any single artifact digest must change the
  manifest digest. This is what makes it a fingerprint.

With that fingerprint you can answer, in one string comparison: "is what is
running in prod byte-identical to what we evaluated?"

## Where the digest gets used

- Stamped into every log line and eval report, so results are attributable.
- Compared in launch gates: eval digest must equal deploy digest.
- Used in incident review: "what changed?" becomes a diff of two manifests.

## Your challenge

Implement `manifest_digest(artifacts)`: a SHA-256 hex digest over the sorted
artifact entries — order-independent, and sensitive to any single change.
