from numbers import Integral
import numpy as np

class PagedCache:
    def __init__(self, block_size=2, total_blocks=4):
        if any(isinstance(size, bool) or not isinstance(size, Integral) or size <= 0
               for size in (block_size, total_blocks)):
            raise ValueError('positive integer sizes required')
        self.block_size, self.total_blocks = block_size, total_blocks
        self.tables, self.blocks, self.refs = {}, {}, {}

    def append(self, sequence, key, value):
        ids = self.tables.get(sequence, [])
        partial = bool(ids) and len(self.blocks[ids[-1]]) < self.block_size
        shared = partial and self.refs[ids[-1]] > 1
        if not partial or shared:
            free = sorted(set(range(self.total_blocks)) - self.blocks.keys())
            if not free:
                raise MemoryError('KV block pool exhausted')
            # Reserve before changing a table or reference count: OOM is atomic.
            new = free[0]
            self.blocks[new] = list(self.blocks[ids[-1]]) if shared else []
            self.refs[new] = 1
            if shared:
                self.refs[ids[-1]] -= 1
                ids[-1] = new
            else:
                ids.append(new)
            self.tables[sequence] = ids
        self.blocks[ids[-1]].append((float(key), float(value)))

    def fork(self, source, target):
        ids = self.tables[source]
        if target in self.tables:
            raise ValueError('target already exists')
        self.tables[target] = list(ids)
        for block in ids:
            self.refs[block] += 1

    def release(self, sequence):
        for block in self.tables.pop(sequence):
            self.refs[block] -= 1
            if self.refs[block] == 0:
                del self.refs[block]
                del self.blocks[block]

    def read(self, sequence):
        return [kv for block in self.tables[sequence] for kv in self.blocks[block]]

    def table(self, sequence):
        return list(self.tables[sequence])

    def stats(self):
        used = len(self.blocks)
        return {'used_blocks': used, 'free_blocks': self.total_blocks - used,
                'wasted_slots': sum(self.block_size - len(b) for b in self.blocks.values())}

def paged_decode(query, cache, sequence):
    entries = np.array(cache.read(sequence))
    scores = query * entries[:, 0]
    p = np.exp(scores - scores.max())
    return float((p / p.sum()) @ entries[:, 1])
