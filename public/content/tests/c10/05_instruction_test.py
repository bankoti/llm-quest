import numpy as np
examples = [([10, 11], [20, 21]), ([12], [])]
got = collate_sft(examples, eos=2, pad=0, max_length=4)
assert np.array_equal(got['input_ids'], [[10, 11, 20, 21], [12, 0, 0, 0]])
assert np.array_equal(got['targets'], [[11, 20, 21, 2], [2, 0, 0, 0]])
assert np.array_equal(got['attention_mask'], [[1, 1, 1, 1], [1, 0, 0, 0]])
assert np.array_equal(got['loss_mask'], [[0, 1, 1, 1], [1, 0, 0, 0]]), 'Score first response and EOS, not prompt or padding'
assert got['loss_mask'].dtype.kind == 'b' and got['attention_mask'].dtype.kind == 'b'
assert examples == [([10, 11], [20, 21]), ([12], [])]
for prompt_size in range(1, 5):
    for response_size in range(4):
        result = collate_sft([([9] * prompt_size, [8] * response_size)], 2, 0, 12)
        assert result['loss_mask'].sum() == response_size + 1
        assert result['targets'][result['loss_mask']].tolist() == [8] * response_size + [2]
for ex, length in [([([], [1])], 4), (examples, 3), ([], 4), ([([1], [-1])], 4)]:
    try:
        collate_sft(ex, 2, 0, length)
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid/truncated examples')
print('Instruction-collation checks passed.')
