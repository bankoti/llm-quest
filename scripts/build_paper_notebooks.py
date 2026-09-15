"""Build self-contained notebooks from the exact shipped lessons and exercises.

python scripts/build_paper_notebooks.py [--check]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'public/content'
LABS = [
    ('c2/05_flash_io', 'c2/09_io_aware_attention.md', 'flash_torch.py'),
    ('c2/03_sparse_moe', 'c2/06_moe.md', 'switch_training.py'),
    ('c9/01_scaling_laws', 'c9/01_scaling_laws.md', 'scaling_runs.py'),
    ('c9/08_zero', 'c9/08_zero.md', None),
    ('c7/09_paged_cache', 'c7/10_paged_attention.md', None),
]
EXTRA = {
    'c9/08_zero': '''for ranks in [1, 2, 4, 8]:
    for stage in range(4):
        state = zero_memory(1_000_000_000, ranks, stage)
        print(ranks, stage, {k: v/1e9 for k,v in state.items()})
print("These are persistent GB per logical rank, not measured process memory.")
''',
    'c7/09_paged_cache': '''for size in [2, 4, 8]:
    cache = PagedCache(size, 20)
    for i in range(9): cache.append("original", i, i*10)
    cache.fork("original", "branch")
    before = cache.stats()
    cache.append("branch", 9, 90)
    print({"block_size": size, "shared_prefix": before, "after_append": cache.stats()})
    assert len(cache.read("original")) == 9
    assert len(cache.read("branch")) == 10
print("Compare internal waste and block counts; this does not measure GPU throughput.")
''',
}

def cell(kind, body, tag=None):
    result = {'cell_type': kind, 'metadata': {'tags': [tag]} if tag else {},
              'source': body.splitlines(keepends=True)}
    if kind == 'code':
        result.update(execution_count=None, outputs=[])
    return result

def notebook(name, lesson, experiment):
    prose = (CONTENT / 'lessons' / lesson).read_text().replace('(content/images/', '(https://bankoti.github.io/llm-quest/content/images/')
    cells = [cell('markdown', prose),
             cell('markdown', '## Work first, then compare\n\nCPU runtime is sufficient for the exercises. NumPy and PyTorch are available in Colab. Run the starter and grading cells after implementing the TODOs. An untouched starter is expected to fail. The reference solution below replaces the functions only when you deliberately run that cell. Then rerun the checks. No account, key, model download, or paid GPU is required.\n'),
             cell('code', (CONTENT / 'challenges' / f'{name}.py').read_text(), 'starter'),
             cell('code', (CONTENT / 'tests' / f'{name}_test.py').read_text(), 'grade'),
             cell('markdown', '## Worked reference solution\n\nCompare the state transitions and invariants with your implementation. Passing output tests alone does not establish memory efficiency or reproduce the paper\'s performance results.\n'),
             cell('code', (CONTENT / 'solutions' / f'{name}.py').read_text(), 'reference'),
             cell('code', (CONTENT / 'tests' / f'{name}_test.py').read_text(), 'reference-grade'),
             cell('markdown', '## Experiment and interpretation\n\nPredict the result before running. Change one variable, repeat, and record what changed. Separate measured outcomes from assumptions.\n'),
             cell('code', (ROOT / 'experiments' / experiment).read_text() if experiment else EXTRA[name], 'experiment')]
    for i, c in enumerate(cells):
        c['id'] = f'paper-cell-{i}'
    return {'nbformat':4, 'nbformat_minor':5, 'metadata':{
        'kernelspec':{'name':'python3','display_name':'Python 3'},
        'language_info':{'name':'python'},
        'colab':{'name':name.split('/')[-1]+'.ipynb','provenance':[]}}, 'cells':cells}

def main():
    for name, lesson, experiment in LABS:
        path = ROOT / 'colab' / f'{name}.ipynb'
        body = json.dumps(notebook(name, lesson, experiment), indent=1, ensure_ascii=False) + '\n'
        if '--check' in sys.argv:
            assert path.read_text() == body, f'{path} is stale; regenerate paper notebooks'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(body)
        print(f'Notebook ready: {name}')

if __name__ == '__main__':
    main()
