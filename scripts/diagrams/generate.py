"""Generate all SVG lesson diagrams.
Run from the repo root:  python scripts/diagrams/generate.py
Outputs land in public/content/images/<cN>/<name>.svg
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pathlib import Path

BASE = Path(__file__).parent.parent.parent / "public" / "content" / "images"

import d_c1, d_c2, d_c4, d_c6, d_c7

all_diagrams = d_c1.DIAGRAMS + d_c2.DIAGRAMS + d_c4.DIAGRAMS + d_c6.DIAGRAMS + d_c7.DIAGRAMS

for rel_path, fn in all_diagrams:
    out = BASE / rel_path
    out.parent.mkdir(parents=True, exist_ok=True)
    fn(str(out))

print(f"Generated {len(all_diagrams)} SVG diagrams into {BASE}")
