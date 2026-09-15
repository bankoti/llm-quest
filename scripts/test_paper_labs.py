"""Execute reference solutions against the same graders delivered to learners.

Run: uv run --with numpy python scripts/test_paper_labs.py
"""
from pathlib import Path

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
    assert passed == 7, f'Expected seven reference exercises, got {passed}'

if __name__ == '__main__':
    main()
