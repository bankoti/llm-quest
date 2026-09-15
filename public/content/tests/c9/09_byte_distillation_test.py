import numpy as np
_vocab = [b'a', b'ab', b'ac', b'b']
_prob = np.array([.1, .4, .3, .2])
_z = np.log(_prob)
_before = _z.copy()
_first = byte_targets(_z, _vocab)
assert _first.shape == (256,)
np.testing.assert_allclose(_first[[97, 98]], [.8, .2])
_approx = byte_targets(_z, _vocab, b'a')
_exact = byte_targets(_z, _vocab, b'a', True)
assert _exact.shape == (257,)
np.testing.assert_allclose(_approx[[98, 99]], [4/7, 3/7])
np.testing.assert_allclose(_exact[[98, 99, 256]], [.5, .375, .125])
for _out in [_first, _approx, _exact]:
    assert np.isfinite(_out).all() and (_out >= 0).all()
    np.testing.assert_allclose(_out.sum(), 1)
np.testing.assert_array_equal(_z, _before)

# Reconstruct each complete token path, including its final EOT probability.
_rng = np.random.default_rng(8)
for _tokens in [_vocab, [b'x', b'xy', b'xyz', b'xz'], [b'\xc3', b'\xc3\xa9', b'\xff']]:
    for _ in range(5):
        _p = _rng.dirichlet(np.ones(len(_tokens)))
        for _i, _token in enumerate(_tokens):
            _path = 1.
            for _j, _byte in enumerate(_token):
                _path *= byte_targets(np.log(_p), _tokens, _token[:_j], True)[_byte]
            _path *= byte_targets(np.log(_p), _tokens, _token, True)[256]
            np.testing.assert_allclose(_path, _p[_i], atol=1e-12, rtol=1e-10)
np.testing.assert_allclose(byte_targets([10000, 0, 0], [b'a', b'bx', b'by'], b'b')[[120, 121]], [.5, .5])
assert byte_targets([0, -np.inf], [b'a', b'ab'], b'a', True)[256] == 1

_targets = np.array([[.7, .3, 0.], [0., 0., 1.]])
_student = np.array([[10001., 10000., 9999.], [-1000., 0., 1000.]])
_saved = _student.copy()
_shift = _student - _student.max(1, keepdims=True)
_logq = _shift - np.log(np.exp(_shift).sum(1, keepdims=True))
_expected = sum(_targets[i,j] * (np.log(_targets[i,j]) - _logq[i,j])
                for i in range(2) for j in range(3) if _targets[i,j] > 0) / 2
np.testing.assert_allclose(distillation_kl(_student, _targets), _expected, atol=1e-12)
np.testing.assert_allclose(distillation_kl(np.log([[.2, .8]]), [[.2, .8]]), 0, atol=1e-12)
np.testing.assert_array_equal(_student, _saved)
for _call in [
    lambda: byte_targets([0], [b'a'], b'a'),
    lambda: byte_targets([0], [b'a'], b'z', True),
    lambda: byte_targets([-np.inf], [b'a']),
    lambda: byte_targets([0, 0], [b'a', b'a']),
    lambda: byte_targets([0], [b'']),
    lambda: byte_targets([0], ['a']),
    lambda: byte_targets([0], [b'a'], 'a'),
    lambda: byte_targets([np.nan], [b'a']),
    lambda: byte_targets([np.inf], [b'a']),
    lambda: byte_targets([[0]], [b'a']),
    lambda: byte_targets([0, 1], [b'a']),
    lambda: distillation_kl([[0, 0]], [[.2, .2]]),
    lambda: distillation_kl([[0, 0]], [[-1, 2]]),
    lambda: distillation_kl([[np.inf, 0]], [[0, 1]]),
    lambda: distillation_kl([[0, 0]], [[np.nan, 1]]),
    lambda: distillation_kl([], []),
]:
    try:
        _call()
    except ValueError:
        pass
    else:
        raise AssertionError('invalid or unsupported input must raise ValueError')
print('Byte targets conserve path probability; approximate boundary loss and stable KL verified.')
