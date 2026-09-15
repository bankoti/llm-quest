"""Behavior checks for the learned-byte-student experiment; needs numpy/torch."""
from pathlib import Path
import runpy
import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[1]
lab = runpy.run_path(str(ROOT / 'experiments/byte_student.py'))
reference = runpy.run_path(str(ROOT / 'public/content/solutions/c9/09_byte_distillation.py'))

# Same objective as the browser exercise, including zero teacher probabilities.
z = torch.tensor([[2., -1., 0.], [0., 3., -2.]], dtype=torch.float64, requires_grad=True)
p = torch.tensor([[.7, .3, 0.], [0., .4, .6]], dtype=torch.float64)
loss = lab['student_loss'](z[None], torch.zeros(1,2,dtype=torch.long), p[None], torch.ones(1,2,dtype=torch.bool), True)
np.testing.assert_allclose(float(loss.detach()), reference['distillation_kl'](z.detach().numpy(), p.numpy()), atol=1e-12)
loss.backward()
torch.testing.assert_close(z.grad, (z.detach().softmax(-1)-p)/2)
z2 = torch.zeros(1,2,3, requires_grad=True)
masked = lab['student_loss'](z2, torch.zeros(1,2,dtype=torch.long), p[None].float(), torch.tensor([[True,False]]), True)
masked.backward()
assert not z2.grad[0,1].any() and z2.grad[0,0].abs().sum() > 0

train = lab['segmented_data'](24, 41)
val = lab['segmented_data'](12, 42, map(tuple, train.tolist()))
def texts(ids):
    return {b''.join(lab['VOCAB'][i] for i in row) for row in ids.tolist()}
assert texts(train).isdisjoint(texts(val))
ids = torch.tensor([[0,1]])  # a, ab: 3 content bytes, 2 boundaries
encoded = lab['byte_dataset'](ids, torch.zeros(1,2,7), True, reference['byte_targets'])
x, y, targets, mask, content = encoded
assert y.tolist() == [[97,256,97,98,256]]
assert x.tolist() == [[257,97,256,97,98]]
assert content.tolist() == [3] and mask.sum() == 5
torch.testing.assert_close(targets.sum(-1), torch.ones(1,5))

result = lab['run_byte_experiment'](reference['byte_targets'], steps=10, seeds=(5,))
assert len(result['rows']) == 4
assert len({r['train_content_bytes_seen'] for r in result['rows']}) == 1
for row in result['rows']:
    assert row['parameters'] < result['setup']['teacher_parameters']
    assert np.isfinite(row['validation_representation_BPB'])
    extra = 10*16*8 if row['representation'] == 'bytes+EOT' else 0
    assert row['train_prediction_units_seen'] == row['train_content_bytes_seen'] + extra
    assert row['serving']['parameter_storage_bytes'] == row['parameters'] * 4
    assert row['serving']['sequential_bytes_per_second'] is None or row['serving']['completed_8_bytes']
print('Training gradients, padding exclusion, raw-text split, boundary targets, four learned arms and cost accounting passed.')
