# PagedAttention: Give Each Sequence a Block Table

Prerequisites: KV caching, stable softmax, dictionaries, and reference ownership.
Allow 60-90 minutes. Build a bounded cache, fork a shared prefix, append safely,
and verify attention still sees the same sequence as a contiguous cache.

## Why reservation wastes space

Output length is unknown when a request arrives. Reserving its maximum contiguous
cache leaves unused space; requiring growth into adjacent storage constrains
placement. Fixed-size KV blocks let requests grow using any available block.
A table maps each sequence's logical blocks to physical storage.

For block size B and logical token position t:

```text
logical_block = t // B
offset = t % B
physical_block = sequence_table[logical_block]
entry = physical_blocks[physical_block][offset]
```

With B=2 and table `[0,2,1]`, token position 5 lives in physical block 1, slot 1.
Sorting the table would scramble context. Paging changes addresses, not the
attention equation or which tokens the query may use.

## Follow one shared prefix

1. A caches three tokens: physical block 0 holds tokens 1,2; block 1 holds token 3.
2. Fork B from A. Both tables are `[0,1]`; each block has two owners. No copy yet.
3. B appends token 4. Block 1 is partial and shared, so copy it to free block 2
   and append there. B's table becomes `[0,2]`. A's history remains unchanged.
4. A finishes. Its reference to block 0 disappears, but B still owns that block.
   Block 1 reaches zero owners and becomes free.
5. B appends token 5. Reuse block 1. B's table becomes `[0,2,1]`.

A reference count records how many sequence tables own a physical block.
Copy-on-write means creating a private copy before modifying shared storage.
Forking must copy the list of block IDs; sharing the list object itself would
let one sequence change the other's mapping.

## Make out-of-memory behavior explicit

The pool has a fixed number of blocks. An append requiring a new block can fail.
Reserve the block before changing a table or reference count. If allocation
fails, raise `MemoryError` with both histories intact. A serving scheduler can
then defer, reject, or preempt work according to a separate policy.

Appending to a full shared block allocates a new block without copying the full
one. Appending to a partial shared block needs a copy. Once only one owner
remains, that partial block can be extended in place.

## Implement the cache and attention

Use dictionaries for block tables, block contents, and reference counts. Choose
the lowest free physical ID to make test traces reproducible. Each token stores
a scalar `(key,value)` pair so address translation is easy to inspect.

For scalar query q, calculate `scores = q*keys`, then stable softmax and the
weighted sum of values. All cached positions are visible at this decode step;
head dimension is 1, so the attention scale is 1. This reference materializes
logical entries for comparison. It does not implement a fused paged GPU kernel.

The `stats` contract counts physical storage once even if shared. For 9 unshared
tokens and B=4, 3 blocks allocate 12 slots and waste 3 inside occupied blocks.
Unallocated blocks are capacity, not internal fragmentation. Real blocks also
have metadata and scheduling costs. Sharing can further reduce duplicate prefix
storage; it does not make arbitrary contexts free.

## Verification and solutions

The grader checks non-contiguous addresses, reference counts through observable
release behavior, branch isolation, block reuse, immutable table snapshots, and
atomic failure during ordinary growth and copy-on-write. Decode is compared
against contiguous attention for positive, negative, zero, and large queries.

In the notebook, increase block size while keeping request lengths fixed.
Predict internal waste first. Then compare shared and duplicated prefixes.
Smaller blocks reduce tail waste but create more table entries and management
work; this simulator cannot measure GPU throughput or select the best production
block size. Paged allocation and continuous batching are related but distinct:
one manages memory, the other decides which requests execute together.

**Exit check:** Explain when a copy is necessary, when a block can be freed, and
why byte savings alone do not establish a serving throughput improvement.

Primary source: [Kwon et al., PagedAttention and vLLM](https://arxiv.org/abs/2309.06180).
