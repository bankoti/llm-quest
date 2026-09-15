import numpy as np
outs=np.array([[[1.,0.],[0.,2.],[9.,9.]],[[2.,2.],[4.,4.],[8.,8.]]])
logits=np.array([[2.,1.,-10.],[-10.,0.,0.]])
comb=route(outs,logits,k=2)
assert comb.shape==(2,2),f"shape: {comb.shape}"
assert np.all(comb[0]<np.array([1.01,2.01])),"expert 2 (logit -10) must be excluded"
assert np.allclose(comb[1],[6.,6.],atol=1e-5),f"equal-weight mix=[6,6], got {comb[1]}"
print("✓ shape correct")
print("✓ inactive expert excluded")
print("✓ equal-weight routing correct")
_calls = [[], [], []]
def _make_expert(i):
    def _expert(batch):
        _calls[i].append(len(batch))
        return batch * (i + 1)
    return _expert
_experts = [_make_expert(i) for i in range(3)]
_x = np.arange(1, 13, dtype=float).reshape(6, 2)
_logits = np.array([[2., 0., -1.]] * 4 + [[0., 2., -1.]] * 2)
_out, _accepted, _aux = switch_forward(_x, _logits, _experts)
assert _accepted.dtype == bool and _accepted.shape == (6,)
assert _accepted.tolist() == [True, True, False, False, True, True], 'capacity and input-order overflow'
assert _calls == [[2], [2], []], 'call only selected experts and accepted tokens'
_p = np.exp(_logits - _logits.max(axis=1, keepdims=True))
_p /= _p.sum(axis=1, keepdims=True)
np.testing.assert_allclose(_out[:2], _x[:2] * _p[:2, 0, None])
np.testing.assert_allclose(_out[2:4], 0)
np.testing.assert_allclose(_out[4:], 2 * _x[4:] * _p[4:, 1, None])
assert abs(_aux - 3 * np.dot([4/6, 2/6, 0], _p.mean(axis=0))) < 1e-10
# All ties route to expert 0; the selected gate is 1/3, not 1.
_o, _a, _l = switch_forward(np.ones((3, 2)), np.zeros((3, 3)), _experts, 3)
np.testing.assert_allclose(_o, 1/3)
assert _a.all() and abs(_l - 1) < 1e-10
try:
    switch_forward(_x, _logits, _experts, 0)
except ValueError:
    pass
else:
    raise AssertionError('nonpositive capacity must fail')
print('Switch gate, sparse execution, capacity, ties, and auxiliary loss passed.')
print("\n+200 XP — Sparse MoE complete.")
