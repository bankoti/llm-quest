import numpy as np
for p in [3, 5, 7, 11]:
    for a in range(p):
        for b in range(p):
            feature, result = clock_sum(a, b, p)
            angle = 2*np.pi*((a+b) % p)/p
            assert np.allclose(feature, [np.cos(angle), np.sin(angle)])
            assert result == (a+b) % p
try:
    clock_sum(1, 2, 1)
except ValueError:
    pass
else:
    raise AssertionError('Invalid modulus must fail')
print('Clock-circuit checks passed.')
