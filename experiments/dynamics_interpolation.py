"""Random-feature capacity sweeps plus repeated-data polynomial bias/variance."""
import json
import numpy as np


def interpolation_experiment():
    results = []
    n = 24
    for seed in [1, 7, 19]:
        rng = np.random.default_rng(seed)
        train_x, test_x = rng.normal(size=(n, 5)), rng.normal(size=(256, 5))
        teacher = rng.normal(size=5)
        clean, test_y = train_x@teacher, test_x@teacher
        bank = rng.normal(size=(5, 96))
        for noise in [0., .5]:
            y = clean + rng.normal(size=n)*noise
            for d in [8, 16, 23, 24, 25, 32, 48, 96]:
                x = np.maximum(train_x@bank[:, :d], 0) / np.sqrt(d)
                xt = np.maximum(test_x@bank[:, :d], 0) / np.sqrt(d)
                for penalty in [0., .1]:
                    w = np.linalg.lstsq(np.vstack([x, np.sqrt(penalty)*np.eye(d)]), np.concatenate([y, np.zeros(d)]), rcond=None)[0]
                    results.append(dict(seed=seed, n=n, width=d, noise=noise, ridge=penalty, train_mse=float(((x@w-y)**2).mean()), test_mse=float(((xt@w-test_y)**2).mean())))
    # Repeated noisy training sets, fixed noiseless target: exact empirical decomposition.
    rng = np.random.default_rng(94)
    grid = np.linspace(-1, 1, 80); truth = np.sin(3*grid)
    polynomial = []
    for degree in [2, 6, 12, 24]:
        predictions = []
        for _ in range(20):
            x = rng.uniform(-1, 1, 16); y = np.sin(3*x)+rng.normal(size=16)*.15
            w = np.linalg.lstsq(np.vander(x, degree+1, increasing=True), y, rcond=None)[0]
            predictions.append(np.vander(grid, degree+1, increasing=True)@w)
        predictions = np.array(predictions); mean = predictions.mean(0)
        bias2 = float(((mean-truth)**2).mean()); variance = float(((predictions-mean)**2).mean())
        mse = float(((predictions-truth)**2).mean())
        assert np.isclose(mse, bias2+variance)
        polynomial.append(dict(degree=degree, bias2=bias2, variance=variance, mse=mse))
    random_design=rng.normal(size=(16,32));random_labels=rng.normal(size=(16,1))
    random_weights=np.linalg.lstsq(random_design,random_labels,rcond=None)[0]
    random_test=rng.normal(size=(128,32));random_test_labels=rng.normal(size=(128,1))
    random_control=dict(train_mse=float(((random_design@random_weights-random_labels)**2).mean()),test_mse=float(((random_test@random_weights-random_test_labels)**2).mean()))
    assert random_control['train_mse']<1e-20
    return dict(capacity_sweep=results, polynomial_bias_variance=polynomial,random_label_control=random_control,
        limitation='No universal second descent is asserted. Monomial bases become ill-conditioned; solver and regularization matter.')


if __name__ == '__main__':
    print(json.dumps(interpolation_experiment(), indent=2))
