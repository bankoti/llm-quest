"""Execute reference solutions against the same graders delivered to learners.

Run: uv run --with numpy python scripts/test_paper_labs.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'public/content'

def main():
    passed = 0
    for solution in sorted((CONTENT / 'solutions').glob('*/*.py')):
        relative = solution.relative_to(CONTENT / 'solutions')
        grader = CONTENT / 'tests' / relative.with_name(relative.stem + '_test.py')
        tests = grader.read_text()
        scope = {'__name__': '__paper_lab__'}
        exec(compile(solution.read_text(), str(solution), 'exec'), scope)
        exec(compile(tests, str(grader), 'exec'), scope)
        # A blank student scaffold must not receive completion credit.
        starter = CONTENT / 'challenges' / relative
        try:
            empty_scope = {'__name__': '__paper_lab__'}
            exec(compile(starter.read_text(), str(starter), 'exec'), empty_scope)
            exec(compile(tests, str(grader), 'exec'), empty_scope)
        except (NotImplementedError, AssertionError, TypeError, AttributeError, ValueError):
            pass
        else:
            raise AssertionError(f'{relative}: unimplemented scaffold passed')
        passed += 1
        print(f'PASS {relative}: solution accepted, empty scaffold rejected')
    expected = {'c1/06_attention', 'c1/07_transformer', 'c2/03_sparse_moe', 'c2/05_flash_io', 'c7/09_paged_cache', 'c9/01_scaling_laws', 'c9/08_zero', 'c9/09_byte_distillation', 'c9/10_byte_evaluation'}
    expected.update(entry['name'] for entry in json.loads((CONTENT/'expansion-manifest.json').read_text()))
    actual = {str(p.relative_to(CONTENT/'solutions').with_suffix('')) for p in (CONTENT/'solutions').glob('*/*.py')}
    assert actual == expected, f'Reference exercise registry mismatch: {actual ^ expected}'
    assert passed == len(expected)

if __name__ == '__main__':
    main()
