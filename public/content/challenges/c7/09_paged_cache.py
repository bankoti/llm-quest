"""A bounded paged KV cache with shared prefixes and copy-on-write.
One logical token holds a scalar key and scalar value. This makes address
translation visible without tensor indexing noise; it is not a GPU kernel.
"""
import numpy as np

class PagedCache:
    def __init__(self, block_size=2, total_blocks=4):
        """Positive integer sizes; invalid sizes raise ValueError.
        Store sequence block tables, physical blocks, and reference counts.
        """
        raise NotImplementedError

    def append(self, sequence, key, value):
        """Create sequence if needed; append finite scalar K/V.
        Allocate the lowest free block ID when necessary. If the last block is
        partial and shared, copy it before writing (copy-on-write).
        If no free block exists raise MemoryError WITHOUT changing any state.
        """
        raise NotImplementedError

    def fork(self, source, target):
        """Share source's blocks with new target. No physical copy yet.
        Missing source: KeyError. Existing target: ValueError. No mutation on error.
        """
        raise NotImplementedError

    def release(self, sequence):
        """Decrement references; free blocks only when no sequence owns them.
        Unknown sequence: KeyError. Releasing one branch must preserve the other.
        """
        raise NotImplementedError

    def read(self, sequence):
        """Logical ordered list of (key,value) pairs; unknown sequence: KeyError."""
        raise NotImplementedError

    def table(self, sequence):
        """Copy of logical->physical block IDs; unknown sequence: KeyError."""
        raise NotImplementedError

    def stats(self):
        """Return used_blocks, free_blocks, wasted_slots (in occupied blocks).
        Shared physical blocks count once. Unallocated blocks are not waste.
        """
        raise NotImplementedError

def paged_decode(query, cache, sequence):
    """Scalar query: stable softmax(query * cached_keys) dot cached_values.
    Read through the block table. All cached tokens are visible at this decode
    position. D=1, so sqrt(D)=1. Must match a contiguous-cache computation.
    """
    raise NotImplementedError
