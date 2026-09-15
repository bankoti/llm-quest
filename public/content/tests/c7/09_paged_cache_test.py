import numpy as np
for _size in [0, -1, 1.5, 2.0, float('nan'), float('inf'), True, False, '2', None]:
    for _sizes in [(_size, 4), (2, _size)]:
        try:
            PagedCache(*_sizes)
        except ValueError:
            pass
        else:
            raise AssertionError(f'positive integer sizes required: {_sizes}')
_c = PagedCache(block_size=2, total_blocks=4)
_c.append('a', 1, 10)
_c.append('a', 2, 20)
_c.append('b', 9, 90)
_c.append('a', 3, 30)
assert _c.table('a') == [0, 2], 'logical order differs from physical adjacency'
_c.fork('a', 'branch')
assert _c.stats() == {'used_blocks': 3, 'free_blocks': 1, 'wasted_slots': 2}
_c.append('branch', 4, 40)
assert _c.table('branch') == [0, 3], 'copy partial shared block before append'
assert _c.read('a') == [(1., 10.), (2., 20.), (3., 30.)]
assert _c.read('branch')[-1] == (4., 40.)
for _seq in ['a', 'branch', 'b']:
    _entries = np.array(_c.read(_seq))
    for _q in [0., 1., -2., 1000.]:
        _s = _q * _entries[:, 0]
        _p = np.exp(_s - _s.max()); _p /= _p.sum()
        assert abs(paged_decode(_q, _c, _seq) - _p @ _entries[:, 1]) < 1e-10
_before = (_c.read('branch'), _c.table('branch'), _c.stats())
try:
    _c.append('branch', 5, 50)
except MemoryError:
    pass
else:
    raise AssertionError('full pool must reject growth')
assert (_c.read('branch'), _c.table('branch'), _c.stats()) == _before
_c.release('a')
assert _c.read('branch') == [(1., 10.), (2., 20.), (3., 30.), (4., 40.)]
_c.append('branch', 5, 50)
assert _c.table('branch') == [0, 3, 2], 'reuse the freed block'
_c.release('b'); _c.release('branch')
assert _c.stats() == {'used_blocks': 0, 'free_blocks': 4, 'wasted_slots': 0}
# Copy-on-write failure must also leave both owners untouched.
_c = PagedCache(2, 1); _c.append('a', 1, 2); _c.fork('a', 'b')
try:
    _c.append('b', 3, 4)
except MemoryError:
    pass
else:
    raise AssertionError('shared partial block needs a free copy')
assert _c.read('a') == _c.read('b') == [(1., 2.)]
_c.release('a'); _c.append('b', 3, 4)
assert _c.read('b') == [(1., 2.), (3., 4.)], 'last owner may mutate in place'
_t = _c.table('b'); _t.clear()
assert _c.table('b') == [0], 'table() must not expose mutable ownership state'
for _operation, _error in [(lambda: _c.fork('b', 'b'), ValueError), (lambda: _c.release('missing'), KeyError), (lambda: PagedCache(0, 1), ValueError)]:
    try:
        _operation()
    except _error:
        pass
    else:
        raise AssertionError('invalid operation must fail')
print('Paged decode, sharing, copy-on-write, OOM atomicity, and block reclamation passed.')
