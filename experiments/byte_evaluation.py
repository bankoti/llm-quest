"""Original synthetic observations: exercise evidence accounting, not paper data."""
import json
from pathlib import Path
import runpy
import numpy as np

def run_evaluation_experiment(metrics=None):
    if metrics is None:
        file = Path(__file__).resolve().parents[1] / 'public/content/solutions/c9/10_byte_evaluation.py'
        metrics = runpy.run_path(str(file))
    budgets = np.array([10., 20., 40.])
    observed_scores = np.array([40., 50., 54.])
    # Fit y = a + b/C using ONLY the first two observations, then hold out C=40.
    design = np.column_stack([np.ones(2), 1/budgets[:2]])
    a, b = np.linalg.lstsq(design, observed_scores[:2], rcond=None)[0]
    held_out_prediction = a + b/40
    projections = []
    for noise in [-1., 0., 1.]:
        perturbed = observed_scores[:2] + np.array([0., noise])
        intercept, slope = np.linalg.lstsq(design, perturbed, rcond=None)[0]
        projections.append({'second_observation_delta': noise, 'forecast_at_100': float(intercept+slope/100),
                            'region_relative_to_fit_data': metrics['evidence_region'](budgets[:2], 100)})
    return {'source': 'synthetic teaching observations; not measurements from the paper',
            'observations': list(zip(budgets.tolist(), observed_scores.tolist())),
            'held_out_C40': {'predicted': float(held_out_prediction), 'observed': 54., 'absolute_error': float(abs(held_out_prediction-54))},
            'extrapolation_sensitivity': projections,
            'representation_BPB': metrics['bits_per_byte']([np.log(2)]*8, 4),
            'same_content_target_payload_bytes': {'dense_token': metrics['logit_storage'](10, 1000),
                                                'top5_token': metrics['logit_storage'](10, 1000, 5),
                                                'dense_byte': metrics['logit_storage'](45, 256)},
            'sequential_serving_example': metrics['serving_summary']([10, 90], [100, 300])}

if __name__ == '__main__':
    METRICS = globals() if 'bits_per_byte' in globals() else None
    RESULTS = run_evaluation_experiment(METRICS)
    print(json.dumps(RESULTS, indent=2))
    print('A two-point fit is not a validated scaling law. The omitted observation tests the fit once; changing a point exposes extrapolation sensitivity. No benchmark scores or timings above are real model measurements.')
