import hashlib

def manifest_digest(artifacts: dict) -> str:
    """Digest of a release manifest — one string that identifies the release.

    `artifacts` maps artifact name -> content hash, e.g.
    {"model": "sha256:abc", "index": "sha256:def"}.

    Requirements:
    - Deterministic and order-independent: the same dict must produce the
      same digest regardless of insertion order. (Serialize the items in
      a canonical order before hashing.)
    - Sensitive: changing any name or hash changes the digest.
    - Return the sha256 hex digest (64 hex chars) of that canonical form.

    This digest is what gets stamped on deploys, logs, and eval reports so
    "which exact release was this?" always has a one-string answer.
    """
    raise NotImplementedError
