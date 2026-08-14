# 02 - Pretraining Data Pipeline

## Why data dominates quality

Scaling laws shift their prefactor when data quality changes. A cleaner corpus
lowers loss at every scale. Practitioners now treat data curation as
equal-weight to architecture and optimization.

## Pipeline stages

```text
raw web crawl
    -> language identification
    -> URL and content deduplication
    -> quality filters (heuristics + classifier)
    -> domain mix weighting
    -> tokenization and shuffle
    -> training shards
```

Each stage makes an irreversible decision. Removed documents cannot be
recovered later.

## Deduplication

Exact deduplication removes identical byte sequences. Fuzzy deduplication
(MinHash LSH) removes near-duplicates sharing roughly 80%+ of n-grams.
A document seen ten times contributes one new learning signal but occupies
ten positions in the training budget: duplication trades data efficiency
for redundancy.

## Quality filtering

Heuristics include minimum length, fraction of alphabetic characters, and
presence of boilerplate. Classifier-based filters train a binary model on
high-quality text versus raw crawl. FineWeb reports roughly 15% token
retention from CommonCrawl after deduplication and filtering.

Over-filtering is a real risk: heuristics that penalize short lines can
silently remove math and code, which are scarce by nature.

## Domain mix

Training on a mixture of web, code, books, and math outperforms web alone.
Llama 3 reports approximately 50% web text, 25% code, 10% math, and 15%
other curated sources. Mix weights are tuned by held-out perplexity on
domain-specific benchmarks.

## Tokenization at scale

GPT-4 and Llama 3 use a 128K-vocabulary BPE tokenizer. A larger vocabulary
compresses text more (fewer tokens per character), reducing effective sequence
length and training cost, but increases embedding matrix size. For a 7B model,
the embedding matrix at 128K vocab is roughly 2GB at bfloat16.

## Exit check

A team has 10T raw tokens. Estimate how many high-quality tokens remain at
15% retention. Then explain why the same 10T raw tokens produce different
quality outcomes depending on whether deduplication runs before or after
quality filtering.
