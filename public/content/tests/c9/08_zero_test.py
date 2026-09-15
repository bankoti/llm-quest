import numpy as np
assert [sum(zero_memory(1000, 4, s).values()) for s in range(4)] == [16000, 7000, 5500, 4000]
assert zero_memory(5, 2, 3) == {'weights': 6, 'gradients': 6, 'optimizer': 36}
assert sum(zero_memory(100, 1, 3).values()) == 1600
assert sum(zero_memory(0, 3, 2).values()) == 0
for _args in [(-1, 2, 0), (1, 0, 0), (1, 2, 4)]:
    try:
        zero_memory(*_args)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid memory inputs must fail')
_rng = np.random.default_rng(8)
for _ranks in [1, 2, 4, 9]:
    _full = _rng.normal(size=7)
    _shards = [a.copy() for a in np.array_split(_full, _ranks)]
    _ms = [np.zeros_like(a) for a in _shards]
    _vs = [np.zeros_like(a) for a in _shards]
    _m, _v = np.zeros(7), np.zeros(7)
    for _step in range(1, 5):
        _grads = [_rng.normal(size=7) for _ in range(_ranks)]
        _before = [a.copy() for a in _shards]
        _new, _ms, _vs = sharded_adam_step(_shards, _grads, _ms, _vs, _step, .03)
        for _a, _b in zip(_before, _shards):
            np.testing.assert_array_equal(_a, _b)
        _shards = _new
        _g = np.mean(_grads, axis=0)
        _m = .9 * _m + .1 * _g
        _v = .999 * _v + .001 * _g ** 2
        _full -= .03 * (_m / (1 - .9 ** _step)) / (np.sqrt(_v / (1 - .999 ** _step)) + 1e-8)
        np.testing.assert_allclose(np.concatenate(_shards), _full, atol=1e-12)
        np.testing.assert_allclose(np.concatenate(_ms), _m, atol=1e-12)
        np.testing.assert_allclose(np.concatenate(_vs), _v, atol=1e-12)
print('ZeRO accounting and four sharded Adam steps agree with the unsharded baseline.')
