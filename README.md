# LLM Quest

Interactive LLM lessons and graded Python exercises: [open the course](https://bankoti.github.io/llm-quest/).

## Six papers, both learning modes

These are concept and implementation labs, not reproductions of large-scale
paper benchmarks. Read the assumptions and limitations in each lesson.

| Paper | Interactive lesson | Coding exercise | Practical depth |
|---|---|---|---|
| Attention Is All You Need | [QKV](https://bankoti.github.io/llm-quest/interactive/qkv-attention), original encoder-decoder in Key Papers | [Attention](https://bankoti.github.io/llm-quest/level/c1-l6), [Transformer block](https://bankoti.github.io/llm-quest/level/c1-l7) | NumPy core; existing PyTorch tiny-GPT scaffold |
| Chinchilla | [Equal-compute allocations](https://bankoti.github.io/llm-quest/interactive/scaling-laws) | [Scaling budget](https://bankoti.github.io/llm-quest/level/c9-l1) | Formula invariants; three widths and three seeds in a tiny causal-LM experiment |
| FlashAttention | [Tiles and online softmax](https://bankoti.github.io/llm-quest/interactive/flash-attention) | [Exact tiled attention](https://bankoti.github.io/llm-quest/level/c2-l5) | NumPy recurrence; PyTorch outputs/gradients; optional CUDA backend comparison |
| ZeRO | [Training-state ownership](https://bankoti.github.io/llm-quest/interactive/zero-sharding) | [Sharded Adam](https://bankoti.github.io/llm-quest/level/c9-l8) | Stage 0-3 accounting and CPU logical-rank simulation; no distributed runtime |
| Switch Transformers | [Gates and capacity](https://bankoti.github.io/llm-quest/interactive/switch-transformer) | [Sparse execution](https://bankoti.github.io/llm-quest/level/c2-l3) | Actual selected-expert calls, overflow, balancing loss; small learned-router experiment |
| PagedAttention | [Block tables and sharing](https://bankoti.github.io/llm-quest/interactive/paged-attention) | [Paged KV cache](https://bankoti.github.io/llm-quest/level/c7-l9) | Bounded allocator, copy-on-write, reuse, and scalar decode equivalence; no GPU kernel |

Lessons follow prerequisite concepts. The six papers do not form a mandatory
chronological build order. Coding prerequisites still apply; a direct lesson
link may lead to the preceding required work. Existing completed records and XP
are preserved; new levels start incomplete and unlock through the course graph.
Learners who previously completed an expanded exercise can reopen it to try the
new requirements; old completion records are not silently revoked.

## Beyond BPE: byte-model distillation

The advanced [Breaking the Token Ceiling](https://arxiv.org/abs/2609.12303)
module connects the tokenizer, distillation, and scaling lessons:

1. [Bytes, Tokens, and Boundaries](https://bankoti.github.io/llm-quest/interactive/byte-boundaries): UTF-8 content, teacher segmentation, and EOT prediction units.
2. [Distillation Across Tokenizations](https://bankoti.github.io/llm-quest/interactive/byte-distillation): compare approximate conversion with boundary-preserving targets and reconstruct token probabilities.
3. [Does the Byte Student Actually Win?](https://bankoti.github.io/llm-quest/interactive/byte-model-evaluation): distinguish observations from fitted predictions and compare equal content.

The [conversion challenge](https://bankoti.github.io/llm-quest/level/c9-l9)
and [evidence audit](https://bankoti.github.io/llm-quest/level/c9-l10) include
worked solutions, hints, spaced review, and self-contained notebooks. They are
appended to Course 9 without renumbering existing levels or revoking progress.
The interactive module has its own prerequisite chain and is an optional advanced
track. Each lesson includes hand calculations and AI-assisted coding checks.

The training notebook learns a token teacher and four smaller byte-student arms
across two seeds: supervised/distilled, with/without EOT. It uses synthetic
segmented text with disjoint raw train/validation strings, not the paper corpus
or a learned BPE tokenizer. It reports fixed-data, unequal-compute training and
constrained CPU decoding for equal returned content. The evaluation notebook
uses clearly labeled synthetic observations to test extrapolation sensitivity.
Neither notebook establishes the paper's scaling predictions or production wins.

### Solutions and experiments

Nine core exercises have a **Show worked solution** control below the coding
arena and an original-paper link. Reference code lives in
`public/content/solutions/` and is tested against the learner's exact grader.
Revealing a solution does not run it or overwrite the editor.

Seven notebooks add the starter, grader, solution, and experiment in one file:

- [FlashAttention](colab/c2/05_flash_io.ipynb)
- [Switch routing](colab/c2/03_sparse_moe.ipynb)
- [Chinchilla allocations](colab/c9/01_scaling_laws.ipynb)
- [ZeRO ownership](colab/c9/08_zero.ipynb)
- [Paged KV cache](colab/c7/09_paged_cache.ipynb)
- [Byte-student distillation](colab/c9/09_byte_distillation.ipynb)
- [Byte-model evidence audit](colab/c9/10_byte_evaluation.ipynb)

They run on CPU with NumPy and PyTorch. CUDA measurements are optional and
explicitly skipped without supported hardware. GPU speedups, cluster memory
savings, and the Chinchilla scaling frontier are not claimed from these toy labs.

The scaling widget uses a symmetric **teaching proxy**, not measured or fitted
loss. Every allocation satisfies `C=6ND`; the 20:1 balance is an assumption.
The training notebook records the small unused budget due to whole-batch rounding.

## Develop and verify

Use Node 24 or newer. Bun's committed lockfile is authoritative.

```sh
bun install --frozen-lockfile
npm run dev
npm test
npm run build
uv run --with numpy python scripts/test_paper_labs.py
uv run python scripts/build_paper_notebooks.py --check
uv run --with numpy --with torch python scripts/test_paper_notebooks.py
uv run --with numpy --with torch python scripts/test_byte_experiment.py
npx playwright install chromium
npm run test:paper-ui
```

`PAPER_PYODIDE=1 npm run test:paper-ui` also runs the nine reference exercises
through the browser's real Pyodide runner; it requires access to the Pyodide CDN.
The focused UI test completes eight lessons at desktop and phone sizes, checks
scoring, solution display, and notebook links, and saves screenshots under
`.paper-test-output/`. The default CI avoids requiring Pyodide's external CDN.

After changing a paper exercise or its lesson, regenerate its self-contained
notebook with `uv run python scripts/build_paper_notebooks.py`. The `--check`
mode detects stale notebooks. General `build_colab.py` leaves these notebooks
under that generator's ownership.

## Primary sources

- [Vaswani et al., Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Hoffmann et al., Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)
- [Dao et al., FlashAttention](https://arxiv.org/abs/2205.14135)
- [Rajbhandari et al., ZeRO](https://arxiv.org/abs/1910.02054)
- [Fedus et al., Switch Transformers](https://arxiv.org/abs/2101.03961)
- [Kwon et al., PagedAttention](https://arxiv.org/abs/2309.06180)
- [Marathe et al., Breaking the Token Ceiling](https://arxiv.org/abs/2609.12303)
