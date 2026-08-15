"""Convert c1-c3 PyTorch lab scripts into Colab notebooks under colab/.

The browser challenges grade numpy; these notebooks are the "Go Deeper" path:
the same exercises with real torch tensors, one click away in Google Colab
(torch preinstalled, free GPU optional).

Usage:  python scripts/build_colab.py [path-to-llm-from-first-principles]

Notebooks are named after the quest challenge file (e.g. c3/03_capacity_compute
.ipynb) so GoDeeper.tsx can derive the URL from level.challengeFile alone.
"""
import json
import re
import sys
from pathlib import Path

QUEST = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else QUEST.parent / "llm-from-first-principles"

# challenge file name -> lab file, per course. None = same name as challenge.
COURSES = {
    "c1": (SOURCE / "workbook", {}),
    "c2": (SOURCE / "courses/02_modern_transformer/workbook", {}),
    "c3": (SOURCE / "courses/03_architecture_atlas/labs",
           {"03_capacity_compute.py": "03_capacity_and_compute.py"}),
}
SITE = "https://bankoti.github.io/llm-quest"


def md_cell(text: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True)}


def code_cell(text: str) -> dict:
    return {"cell_type": "code", "metadata": {}, "execution_count": None,
            "outputs": [], "source": text.rstrip("\n").splitlines(keepends=True)}


def split_blocks(body: str) -> list[str]:
    """Split lab code into cells: setup, one per '# TODO', checks from first assert."""
    lines = body.splitlines(keepends=True)
    starts = [0]
    for i, ln in enumerate(lines):
        if re.match(r"#\s*TODO", ln) and i not in starts:
            starts.append(i)
    for i, ln in enumerate(lines):
        if ln.startswith("assert") and i > starts[-1]:
            starts.append(i)
            break
    blocks, bounds = [], starts + [len(lines)]
    for a, b in zip(bounds, bounds[1:]):
        chunk = "".join(lines[a:b]).strip("\n")
        if chunk:
            blocks.append(chunk)
    return blocks


def convert(course: str, lab_path: Path, notebook_name: str, title: str) -> dict:
    src = lab_path.read_text(encoding="utf-8")
    m = re.match(r'\s*(?:"""|\'\'\')(.*?)(?:"""|\'\'\')\s*', src, re.DOTALL)
    doc = m.group(1).strip() if m else ""
    body = src[m.end():] if m else src

    header = (
        f"# {title}\n\n"
        f"{doc}\n\n"
        f"This is the full **PyTorch** version of a challenge from "
        f"[LLM Quest]({SITE}). The in-browser challenge grades numpy; here you "
        f"work with real tensors. Fill in each `TODO`, then run the checks "
        f"cell.\n\n"
        f"Runs on the free Colab CPU runtime; switch to a GPU via "
        f"*Runtime > Change runtime type* if you want to experiment at scale. "
        f"PyTorch comes preinstalled."
    )
    cells = [md_cell(header)]
    if "mini_llm" in body:
        cells.append(code_cell(
            "# Install the course package (vendored in the LLM Quest repo).\n"
            '%pip install -q "mini-llm-course @ '
            'git+https://github.com/bankoti/llm-quest@main#subdirectory=colab/vendor"'))
    cells += [code_cell(b) for b in split_blocks(body)]

    # Integrity: cells joined must preserve every original code line.
    joined = "\n".join("".join(c["source"]) for c in cells if c["cell_type"] == "code")
    for ln in body.splitlines():
        if ln.strip():
            assert ln in joined, f"{lab_path.name}: lost line {ln!r}"

    return {
        "nbformat": 4, "nbformat_minor": 0,
        "metadata": {
            "colab": {"name": notebook_name, "provenance": []},
            "kernelspec": {"name": "python3", "display_name": "Python 3"},
            "language_info": {"name": "python"},
        },
        "cells": cells,
    }


def main() -> None:
    curriculum = (QUEST / "src/data/curriculum.ts").read_text(encoding="utf-8")
    made = 0
    for course, (lab_dir, renames) in COURSES.items():
        out_dir = QUEST / "colab" / course
        out_dir.mkdir(parents=True, exist_ok=True)
        pattern = rf"title:'([^']+)'[^\n]*challengeFile:'{course}/([^']+)'"
        for title, challenge in re.findall(pattern, curriculum):
            if challenge.startswith("90_"):
                continue  # debug levels are quest-only
            lab = lab_dir / renames.get(challenge, challenge)
            assert lab.exists(), f"missing lab for {course}/{challenge}: {lab}"
            name = challenge.replace(".py", ".ipynb")
            nb = convert(course, lab, name, title)
            (out_dir / name).write_text(
                json.dumps(nb, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
            made += 1
            print(f"  {course}/{name}")
    print(f"{made} notebooks written to {QUEST / 'colab'}")


if __name__ == "__main__":
    main()
