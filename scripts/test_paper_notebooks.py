"""Execute the public solution/verification/experiment path of each notebook.
Run with numpy and torch installed. Starter failures are checked separately.
"""
import json
from pathlib import Path
from build_paper_notebooks import LABS

ROOT = Path(__file__).resolve().parents[1]
for name, _, _ in LABS:
    book = json.loads((ROOT / 'colab' / f'{name}.ipynb').read_text())
    scope = {'__name__': '__main__'}
    for cell in book['cells']:
        if cell['cell_type'] == 'code' and set(cell['metadata'].get('tags', [])) & {'reference', 'reference-grade', 'experiment'}:
            exec(compile(''.join(cell['source']), f'{name}.ipynb:{cell["id"]}', 'exec'), scope)
    print(f'PASS notebook {name}')
