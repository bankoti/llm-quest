"""Synthetic paired comparisons; no paper benchmark numbers are invented."""
import json
import numpy as np

rng=np.random.default_rng(41)
difficulty=rng.uniform(size=80)
a=(difficulty+rng.normal(size=80)*.12<.6).astype(int)
b=(difficulty+rng.normal(size=80)*.12<.65).astype(int)
differences=b-a
draws=differences[rng.integers(80,size=(4000,80))].mean(-1)
print(json.dumps(dict(synthetic=True,trials=80,a_success=float(a.mean()),b_success=float(b.mean()),
    paired_difference=float(differences.mean()),percentile_interval=np.quantile(draws,[.025,.975]).tolist(),
    limitation='Synthetic independent trial construction. Real scene-clustered outcomes need a cluster-aware analysis.'),indent=2))
