"""Build artifacts from typed curriculum JSON on stdin; invoked by build_expansion.mjs.

Authored sources: src/data/expansion/*.ts, solutions, graders, experiments.
Generated outputs: lessons, starters, notebooks, expansion manifest. --check
verifies their exact emitted artifact contract without editing them.
Artifact authoring and freshness checks require Python 3.12.
"""
import ast
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'public/content'


def cell(kind, text, tag=None):
    result = dict(cell_type=kind, metadata={'tags': [tag]} if tag else {}, source=text.splitlines(keepends=True))
    if kind == 'code':
        result.update(execution_count=None, outputs=[])
    return result


def starter(solution):
    tree = ast.parse(solution)
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and not node.name.startswith('_'):
            doc = ast.get_docstring(node)
            node.body = ([ast.Expr(value=ast.Constant(value=doc))] if doc else []) + ast.parse("raise NotImplementedError('Implement this function, then run the checks.')").body
    ast.fix_missing_locations(tree)
    return '# Generated starter; edit the functions in the course editor or notebook.\n' + ast.unparse(tree) + '\n'


def library_body(path, remove_config=False):
    tree = ast.parse(path.read_text())
    tree.body = [node for node in tree.body if not (
        isinstance(node, ast.If) and isinstance(node.test, ast.Compare) and isinstance(node.test.left, ast.Name) and node.test.left.id == '__name__'
    ) and not (remove_config and isinstance(node, ast.ImportFrom) and node.level == 1 and node.module == 'config')]
    return ast.unparse(tree) + '\n'


def lesson(track, unit, scaffold):
    lines = [f"# {unit['title']}", '', unit['summary'], '', '## Before You Start', '',
             f"Course {track['id']}. Entry course: {track['prerequisite']}. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.", '',
             '**Concept prerequisites:** ' + ', '.join(unit['prerequisites']) + '.', '',
             '## What You Will Be Able to Do', '', *['- ' + value for value in unit['outcomes']], '']
    for section in unit['sections']:
        lines += ['## ' + section['title'], '']
        for paragraph in section['lines']:
            lines += [paragraph, '']
    worked = unit['worked']
    lines += ['## Worked Example: ' + worked['title'], '', worked['prompt'], '']
    for index, stage in enumerate(worked['stages'], 1):
        lines += [f"{index}. **{stage['label']}:** {stage['body']}"]
    lines += ['', worked['takeaway'], '', '## Coding Contract', '',
              'Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.', '',
              '```python', scaffold.rstrip(), '```', '', '## Check Your Understanding', '', unit['numeric']['prompt'], '']
    for question in unit['numeric']['questions']:
        lines += ['- ' + question['label']]
    lines += ['', '<details><summary>Worked answers</summary>', '']
    for question in unit['numeric']['questions']:
        lines += [f"- {question['answer']}: {question['reveal']}"]
    lines += ['', '</details>', '', '## Experiment', '', f"Run `experiments/{unit['experiment']}` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.", '']
    lines += ['- ' + value for value in unit['interpretation']]
    lines += ['', '## Transfer Problems', '', *[f'{i}. {value}' for i, value in enumerate(unit['transfer'], 1)], '',
              'For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.', '',
              '## AI-Assisted Coding Route', '',
              '1. Predict the worked example and one edge case without assistance.',
              '2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.',
              '3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.',
              '4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.',
              '5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.',
              '6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.', '',
              '## Completion Evidence', '',
              'A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.', '',
              '## Primary Source', '', f"[{unit['sourceTitle']}]({unit['source']}). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.", '']
    for source in unit.get('references', []):
        lines += [f"- [{source['title']}]({source['url']})"]
    lines += ['']
    return '\n'.join(lines)


def notebook(name, prose, scaffold, solution, grader, experiment):
    cells = [cell('markdown', prose), cell('markdown', '## Runtime\n\nCPU is sufficient. Install the libraries below in a fresh environment. Run the starter and checks after implementing the functions; an untouched starter is expected to fail. Run the reference only when ready to compare. Training experiments are mechanism-scale, not paper benchmark reproductions.\n'),
             cell('code', '%pip install -q "numpy>=1.26,<3" "torch>=2.2,<3"' + (' "gymnasium>=1,<2"' if experiment == 'rl_cartpole.py' else '') + '\n', 'install'),
             cell('code', scaffold, 'starter'), cell('code', grader, 'grade'),
             cell('markdown', '## Worked Solution\n\nRead the explanation and docstrings alongside the code. Verify nonmutation, masks, normalization, and numerical conventions against your own implementation.\n'),
             cell('code', solution, 'reference'), cell('code', grader, 'reference-grade')]
    if experiment in ('scratch_training.py', 'scratch_adaptation.py'):
        vendor = ROOT / 'colab/vendor/src/mini_llm'
        cells += [cell('markdown', '## Existing Course Model\n\nThe exact vendored mini_llm configuration and model are embedded here so the notebook does not depend on a repository clone or network import. The Torch model includes learned normalization affine parameters and exact GELU; the browser capstone deliberately omits affine parameters and uses its documented approximation.\n'),
                  cell('code', (vendor/'config.py').read_text() + '\n' + library_body(vendor/'models.py', True), 'setup')]
    if experiment == 'scratch_adaptation.py':
        cells.append(cell('code', library_body(ROOT/'experiments/scratch_training.py'), 'setup'))
    cells += [cell('markdown', '## Measured Experiment\n\nPredict before running. Change one variable at a time. Report actual outcomes and failures; the lesson does not promise a successful learning curve for every configuration.\n'),
              cell('code', (ROOT/'experiments'/experiment).read_text(), 'experiment')]
    for i, entry in enumerate(cells):
        entry['id'] = f'expansion-{i}'
    return dict(nbformat=4, nbformat_minor=5, metadata=dict(kernelspec=dict(name='python3', display_name='Python 3'), language_info=dict(name='python'), colab=dict(name=name+'.ipynb', provenance=[])), cells=cells)


def emit(path, text):
    if '--check' in sys.argv:
        assert path.exists() and path.read_text() == text, f'Stale or missing generated artifact: {path}'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)


def main():
    if sys.version_info[:2] != (3,12):
        found = '.'.join(map(str,sys.version_info[:2]))
        raise SystemExit(
            f'Expansion artifact authoring requires Python 3.12; found {found}. '
            'Generate with: uv run --python 3.12 node scripts/build_expansion.mjs\n'
            'Check with: uv run --python 3.12 node scripts/build_expansion.mjs --check\n'
            'Alternatively, set PYTHON to a Python 3.12 executable.'
        )
    tracks = json.load(sys.stdin)
    manifest = []
    for track in tracks:
        for index, unit in enumerate(track['units'], 1):
            name = f"c{track['id']}/{unit['key']}"
            solution = (CONTENT/'solutions'/f'{name}.py').read_text()
            grader = (CONTENT/'tests'/f'{name}_test.py').read_text()
            scaffold = starter(solution)
            prose = lesson(track, unit, scaffold)
            emit(CONTENT/'challenges'/f'{name}.py', scaffold)
            emit(CONTENT/'lessons'/f'{name}.md', prose)
            artifact = notebook(name, prose, scaffold, solution, grader, unit['experiment'])
            emit(ROOT/'colab'/f'{name}.ipynb', json.dumps(artifact, indent=1, ensure_ascii=False)+'\n')
            manifest.append(dict(name=name, level=f"c{track['id']}-l{index}", experiment=unit['experiment']))
            print(f'Expansion artifacts ready: {name}')
    emit(CONTENT/'expansion-manifest.json', json.dumps(manifest, indent=2)+'\n')


if __name__ == '__main__':
    main()
