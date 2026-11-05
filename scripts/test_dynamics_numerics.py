"""Behavioral regression for output-channel Fourier energy accounting."""
from pathlib import Path
import runpy
from unittest.mock import patch
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
lab = runpy.run_path(str(ROOT / 'experiments/dynamics_modular.py'))
spectrum = np.zeros((17, 17, 17), dtype=complex)
spectrum[1, 1, :2] = [1j, 1]
spectrum[-1, -1, :2] = [-1j, 1]
spectrum[1, 2, :2] = [2, 0]
spectrum[-1, -2, :2] = [2, 0]

with patch.object(np.fft, 'fft2', return_value=spectrum):
    reports = lab['modular_experiment'](steps=1)

assert [report['seed'] for report in reports] == [3, 8, 21]
for report in reports:
    np.testing.assert_allclose(report['diagonal_frequency_energy_fraction'], 1 / 3)
    assert np.isfinite([report['total_loss'], report['restricted_loss'], report['excluded_loss']]).all()

print('Fourier energy sums squared magnitudes independently across output channels.')
