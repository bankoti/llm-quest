naive=score_matrix_bytes(1,1,4096,2)
assert naive==32*1024*1024,f"4096^2*2=32MiB, got {naive}"
tiled=tile_bytes(64,64,128,2)
assert tiled<naive,"one tile < full matrix"
assert tiled==64*128*2+64*128*2+64*128*2+64*64*2,f"tile bytes: {tiled}"
assert score_matrix_bytes(1,1,8192,2)==4*naive,"doubling tokens->4x memory"
print("✓ naive score matrix correct")
print("✓ tile < full matrix")
import numpy as np
_rng = np.random.default_rng(91)
for _t, _d, _dv in [(1, 3, 2), (7, 4, 3), (13, 5, 2)]:
    _q, _k, _v = _rng.normal(size=(_t, _d)), _rng.normal(size=(_t, _d)), _rng.normal(size=(_t, _dv))
    _s = _q @ _k.T / np.sqrt(_d)
    _s[np.triu_indices(_t, 1)] = -np.inf
    _p = np.exp(_s - _s.max(axis=1, keepdims=True))
    _expected = (_p / _p.sum(axis=1, keepdims=True)) @ _v
    for _b in [1, 2, 4, 20]:
        np.testing.assert_allclose(tiled_attention(_q, _k, _v, _b), _expected, atol=1e-10)
    _changed = _v.copy()
    _changed[-1] += 10000
    np.testing.assert_allclose(tiled_attention(_q, _k, _changed)[:-1], _expected[:-1], atol=1e-10)
# Large logits require running maxima, not raw exponentials.
_q = np.array([[1000.], [1001.], [1002.]])
_k = np.array([[1000.], [1002.], [1001.]])
np.testing.assert_allclose(tiled_attention(_q, _k, np.array([[1.], [2.], [3.]]), 1), [[1.], [2.], [2.]])
try:
    tiled_attention(_q, _k, _k, 0)
except ValueError:
    pass
else:
    raise AssertionError('block size 0 must raise ValueError')
print('Exact agreement, causal isolation, uneven tiles, and stable large logits passed.')
print("\n+200 XP — IO-Aware Attention complete.")
