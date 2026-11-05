# LLM Quest

Interactive LLM lessons and graded Python exercises: [open the course](https://bankoti.github.io/llm-quest/).

## Learning access

Use **Prerequisite locks** on the coding map or a locked lesson to choose guided
progression (on) or unrestricted coding access (off). The preference is saved per
browser and syncs across tabs. Turning it back on restores existing prerequisite
gates; neither choice changes completions, XP, or certificates. Existing grant
unlocks remain intact. Interactive lessons remain freely accessible.

Without a saved preference, locks are on for learners and off for legacy admin
mode. An explicit learner choice takes precedence over admin mode. When browser
storage is unavailable, the choice lasts for the current page session only.
Run `node scripts/test_learning_access.mjs` against the local server on port 5190
(or set `TEST_BASE_URL`) for desktop/mobile access regression checks.

## Complete learning continuations

Continuation courses extend the original interactive and coding routes without
renumbering old levels or changing existing certificate requirements:

| Course | Entry | What the learner builds |
| --- | --- | --- |
| 10: From Components to a Trained LLM | Course 1 | Byte BPE, token-weighted training, serialized checkpoint recovery, weight import, classification, response-only SFT, LoRA, evaluation, full decoder |
| 11: Learning Dynamics and Mechanisms | Course 1 | Residual paths, loss landscapes, modular learning, probes/Fourier ablations, interpolation, grammar/HMM search |
| 12: Reinforcement Learning for Language Models | Course 10 | Hand policy gradients, trajectory scores, real CartPole training, full clipped GRPO, verifier attacks, policy/value search |
| 13: Vision, Action, and World Models | Course 12; optional | CNN/ViT tensors, collapse controls, VLA masks/flow matching, latent prediction, learned dynamics/planning, paired evidence |

Each new unit includes a detailed lesson, worked calculation, interactive checks,
coding contract, independent grader, worked solution, hints, review, a CPU
notebook, transfer problems, and an AI-assisted coding route. No paid model API,
downloaded model, robot, or GPU is required; see the
[experiment and compute boundaries](docs/curriculum-expansion.md#experiments-and-compute).

Read the [implementation scope](docs/curriculum-expansion.md) and the
[exercise/from-scratch coverage crosswalk](docs/coverage-crosswalk.md). The latter
maps all 102 visible Volume II prompts and records what is deliberately not
claimed: unseen figure answers, guaranteed grokking, full paper reproductions,
or physical deployment safety. Existing adequate foundations are reused.

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
chronological build order. With prerequisite locks on, a direct coding lesson
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

Exercises in the [lab registry](src/data/paperLabs.ts) have a **Show worked
solution** control below the coding arena and a primary-source link. Reference
code lives in `public/content/solutions/` and is tested against the learner's exact grader.
Revealing a solution does not run it or overwrite the editor.

Seven original paper notebooks add the starter, grader, solution, and experiment in one file:

- [FlashAttention](colab/c2/05_flash_io.ipynb)
- [Switch routing](colab/c2/03_sparse_moe.ipynb)
- [Chinchilla allocations](colab/c9/01_scaling_laws.ipynb)
- [ZeRO ownership](colab/c9/08_zero.ipynb)
- [Paged KV cache](colab/c7/09_paged_cache.ipynb)
- [Byte-student distillation](colab/c9/09_byte_distillation.ipynb)
- [Byte-model evidence audit](colab/c9/10_byte_evaluation.ipynb)

Continuation notebooks are indexed by the
[generated manifest](public/content/expansion-manifest.json) and available under
`colab/c10` through `colab/c13`. Repeated experiment files intentionally connect
adjacent exercises into one complete training or evaluation workflow.

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
node scripts/test_expansion_progress.mjs
uv run --python 3.12 python scripts/test_expansion_authoring.py
uv run --python 3.12 node scripts/build_expansion.mjs --check
uv run --with numpy python scripts/test_paper_labs.py
uv run python scripts/build_paper_notebooks.py --check
uv run --with numpy --with torch python scripts/test_paper_notebooks.py
uv run --with numpy --with torch python scripts/test_byte_experiment.py
uv run --with numpy --with torch --with gymnasium python scripts/test_expansion.py
npx playwright install chromium
npm run test:paper-ui
```

`PAPER_PYODIDE=1 npm run test:paper-ui` also runs the reference exercises
through the browser's real Pyodide runner; it requires access to the Pyodide CDN.
The [UI suite](scripts/test_paper_ui.mjs) selects paper and continuation lessons
at desktop and phone sizes, checks scoring, lesson geometry, worked-answer
headings, solution display, and notebook links, and saves screenshots under
`.paper-test-output/`. The default CI avoids requiring Pyodide's external CDN.

After changing a paper lesson, starter, grader, reference solution, or experiment,
regenerate its self-contained notebook with
`uv run python scripts/build_paper_notebooks.py`. Edit those source files rather
than the generated notebooks; the generator owns their mapping and notebook-only
experiment cells. The `--check` mode detects stale notebooks. General
`build_colab.py` delegates these notebooks to that generator.

Continuation source text and interactive checks live in `src/data/expansion/`.
Reference functions, public graders, and measured experiment scripts remain
ordinary editable Python files. Use Python 3.12 to author continuation artifacts:
run `uv run --python 3.12 node scripts/build_expansion.mjs` after editing those
sources, and add `--check` to verify generated-artifact freshness. The generator
rejects other Python minor versions before reading curriculum input or writing
artifacts because `ast.unparse` output can change between Python versions.
You can also set `PYTHON` to the path of a Python 3.12 executable when invoking
`node scripts/build_expansion.mjs`. This authoring requirement applies to
generation and exact freshness checks; student notebooks retain their own
NumPy/PyTorch runtime setup, and browser exercises run through Pyodide.

The generator emits readable lesson Markdown, starter scaffolds,
self-contained notebooks, and the manifest. Do not manually edit generated
lessons, starters, notebooks, or the manifest: change the reference function's
public docstring/contract or the authored unit, then regenerate. The notebook
test executes the actual reference, grader, setup, and experiment cells in a
fresh namespace per file.

## Primary sources

- [Vaswani et al., Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Hoffmann et al., Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)
- [Dao et al., FlashAttention](https://arxiv.org/abs/2205.14135)
- [Rajbhandari et al., ZeRO](https://arxiv.org/abs/1910.02054)
- [Fedus et al., Switch Transformers](https://arxiv.org/abs/2101.03961)
- [Kwon et al., PagedAttention](https://arxiv.org/abs/2309.06180)
- [Marathe et al., Breaking the Token Ceiling](https://arxiv.org/abs/2609.12303)
