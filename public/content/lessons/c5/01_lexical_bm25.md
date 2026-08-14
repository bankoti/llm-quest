# 01 - Lexical Retrieval and BM25

![BM25 term-frequency saturation](content/images/c5/bm25_saturation.svg)


Lexical retrieval remains strong for exact product names, identifiers, rare terms,
and transparent debugging. BM25 scores a query term using document frequency,
within-document frequency, and length normalization. One common form is:

```text
IDF(q) = log(1 + (N - n(q) + 0.5) / (n(q) + 0.5))

score(D,Q) = sum(q in Q) IDF(q) *
             tf(q,D) * (k1 + 1) /
             (tf(q,D) + k1 * (1 - b + b * |D| / avgdl))
```

`N` is document count, `n(q)` document frequency, `tf` term frequency, and
`avgdl` average document length. `k1` controls term-frequency saturation; `b`
controls length normalization. Implementations differ in tokenization, IDF
variant, field scoring, and defaults, so record them with index version.

## Fields matter more than one text blob

Title, category, description, brand, and attributes have different precision.
Production lexical systems often score fields separately, add exact-match boosts,
and apply filters for stock or policy. Indexing a generated description alongside
verified category data without provenance lets low-trust text dominate truth.

## Analyze failure, not only score

Lexical search misses synonyms, paraphrases, morphology, and multilingual
variation. It can also overvalue keyword overlap: “vegan chicken” and “chicken”
share a token but differ on a hard constraint. These are distinct from tokenizer
bugs and missing metadata.

Open `LexicalRetriever._score`. Match its constants to the equation and compute
one term by hand. Then complete `workbook/01_bm25_math.py`.

## Tests

- a term in fewer documents receives larger IDF;
- repeated terms saturate rather than scaling linearly forever;
- an unavailable product never appears;
- ties are deterministic;
- empty and punctuation-only queries return no candidates;
- a schema or tokenizer change creates a new index version.

**Checkpoint:** Create one exact identifier query where lexical retrieval should
remain authoritative even if dense similarity disagrees.
