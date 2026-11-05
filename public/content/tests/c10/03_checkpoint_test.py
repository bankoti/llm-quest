import numpy as np
src = {'foreign.weight': np.arange(6.).reshape(3, 2), 'foreign.bias': np.array([1., 2., 3.])}
shapes = {'weight': (2, 3), 'bias': (3,)}
mapping = {'weight': ('foreign.weight', True), 'bias': ('foreign.bias', False)}
got = import_weights(src, shapes, mapping)
assert np.array_equal(np.array([10., 20.]) @ got['weight'], src['foreign.weight'] @ np.array([10., 20.]))
got['weight'][0, 0] = -99
assert src['foreign.weight'][0, 0] == 0, 'Imported tensors must not alias sources'
ck = dict(model={}, optimizer={}, rng=[1], cursor=3, step=7, config={'width': 8}, tokenizer_id='bytes-v1')
assert validate_checkpoint(ck, {'width': 8}, 'bytes-v1') == 7
bad_cases = [lambda: import_weights(src, shapes, {**mapping, 'weight': ('foreign.weight', False)}),
             lambda: import_weights({**src, 'extra': np.zeros(1)}, shapes, mapping),
             lambda: import_weights(src, shapes, {'weight': ('foreign.weight', True), 'bias': ('foreign.weight', False)}),
             lambda: validate_checkpoint(ck, {'width': 16}, 'bytes-v1'),
             lambda: validate_checkpoint(ck, {'width': 8}, 'same-size-different-vocab'),
             lambda: validate_checkpoint({k: v for k, v in ck.items() if k != 'optimizer'}, {'width': 8}, 'bytes-v1')]
for call in bad_cases:
    try:
        call()
    except ValueError:
        pass
    else:
        raise AssertionError('Reject incompatible artifacts before loading')
print('Checkpoint and weight-import checks passed.')
