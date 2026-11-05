assert addition_reward(' +0012\n', 5, 7) == 1
assert addition_reward('-3', -5, 2) == 1
for attack in ['answer: 12', '0 1 2 12 99', '12.0', '1.2e1', '12\n13', '__import__("os")', '12'+' '*200, None, '\u0661\u0662', '11']:
    assert addition_reward(attack, 5, 7) == 0, 'Do not reward malformed or wrong answers'
try:
    addition_reward('2', True, 1)
except ValueError:
    pass
else:
    raise AssertionError('Reject Boolean operands')
print('Verifier adversarial checks passed.')
