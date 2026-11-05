# Complete Learning Path: Scope and Acceptance

Status: implemented on the continuation-course branch; release validation is
recorded by the PR and CI. This document records the scope and acceptance
contract, not a claim of frontier-scale research reproduction.

## Inputs and decisions

The November 2026 review mapped 102 visible questions from the supplied Welch
Labs Volume II exercise excerpt. It found gaps in residual-learning experiments,
grokking, double descent, reinforcement learning, VLA robotics, and JEPA/world
models. Questions tied to figures absent from that excerpt cannot be answered
literally; we teach the underlying concepts with original, self-contained cases.

The additional reference is Sebastian Raschka's official
[LLMs-from-scratch repository](https://github.com/rasbt/LLMs-from-scratch).
Its main sequence spans text preparation, attention, GPT construction,
pretraining, classification adaptation, and instruction adaptation, with PyTorch,
training refinements, and LoRA support. We reuse existing course foundations
where they already meet the learning goal, not copy the book or duplicate whole
chapters. The implementation and numerical examples here are original course
material.

## New branches

| Course | Entry requirement | Deliverable |
| --- | --- | --- |
| 10: From Components to a Trained LLM | Course 1 | Tokenizer through training, checkpoint recovery, classification, SFT, adapters, evaluation, full model |
| 11: Learning Dynamics and Mechanisms | Course 1 | Residual paths, landscapes, modular learning, probes, double descent, search/learning trade-offs |
| 12: Reinforcement Learning for Language Models | Course 10 | Stochastic policies, trajectories, REINFORCE, clipped group-relative updates, reward tests, search |
| 13: Vision, Action, and World Models | Course 12 | Optional vision/SSL, VLA, latent prediction, planning, and research comparisons |

Keep all old level IDs, order within old courses, saved completions, XP, and
existing certificate definitions. New levels start incomplete. New branches
must not retroactively gate Courses 2-9 or revoke an existing certificate.
Interactive prerequisites form a parallel concept graph; coding warm-ups remain
just-in-time refreshers, not a second completion gate.

## From-scratch audit

| Capability | Existing evidence | Decision |
| --- | --- | --- |
| Tensor shapes, broadcasting, matrix multiplication | Toolkit and Course 1; interactive foundations | Retain; do not repeat a full Python course |
| Tokenization and shifted context windows | Course 1 tokenizer/batching; vendor byte BPE | Extend to a complete tested byte-BPE lifecycle and tokenizer identity |
| Attention, normalization, MLP, residual stream | Courses 1-3, interactive model lessons | Retain; strengthen numerical graders so inert components fail |
| End-to-end decoder | NumPy block challenge and PyTorch vendor code | Add a full forward/generation capstone connected to actual training |
| Pretraining and validation | Vendor training loop, loss/generalization lessons | Add token-weighted accounting, gradient accumulation, clipping, schedule and actual CPU run |
| Saving and loading | Vendor inference checkpoint | Teach optimizer/RNG/config/tokenizer state and continuation equivalence |
| External pretrained weights | Architecture config reading only | Teach shape/orientation/name checks using a local fixture; real downloads optional |
| Classification fine-tuning | No corresponding complete learner lab | Add nonpadding pooling, labels, baseline, held-out metrics, and a trained head |
| Instruction fine-tuning | Explanatory SFT prose; DPO objective lab | Add collation, prompt/padding masks, EOS, actual update and held-out evaluation |
| LoRA | Interactive explanation | Add coding, frozen-base checks, actual adapter updates and merge equivalence |
| Decoding and model evaluation | Interactive controls and production metrics | Add a reproducible model-specific evaluation and sampling contract |
| Distributed hardware, exhaustive framework ports | ZeRO simulation and optional CUDA comparison | Retain as advanced options; do not make paid hardware a prerequisite |
| Every current model family and vendor API | Architecture atlas; outside finite core scope | Do not duplicate; teach portable mechanisms and explicit limitations |

## Unit contract

Every new unit needs all of the following, not just a title and a link:

1. Prerequisites, outcomes, terms, shapes, assumptions, and a worked calculation.
2. A dependency-wired interactive lesson with scored retrieval and numerical
   transfer questions. Every track also has manipulable, meaningful visual labs.
3. A browser-compatible NumPy/pure-Python challenge with explicit contracts.
4. An independent numerical/behavioral grader and a readable worked solution.
5. Hints, spaced-review questions, and a direct concept warm-up.
6. A self-contained notebook containing starter, grader, solution, experiment,
   expected interpretation, failure cases, and further questions.
7. An AI-assisted route: predict first, ask for a narrow change, inspect the
   mechanism, test a deliberately broken variant, and explain results unaided.
8. Primary sources and a boundary between teaching demonstrations and paper
   reproductions. Do not label a synthetic curve as a measured training run.

The implemented inventory is 26 new units, 26 notebooks, and 16 standalone
experiment scripts, bringing the registered curriculum to 100 interactive
lessons and 103 coding levels. Adjacent notebooks intentionally reuse a complete
experiment so students can connect component exercises to an end-to-end run.
The [coverage crosswalk](coverage-crosswalk.md) maps all 102 visible excerpt
prompts and the practical from-scratch sequence, including explicit exclusions.

## Experiments and compute

CPU defaults use small synthetic datasets with explicit train/validation/test
boundaries and fixed seeds. No credentials, paid endpoints, robot hardware, or
large model downloads are required. Real policy updates and neural training must
actually execute. Optional longer runs may demonstrate grokking, but a short
smoke run must not promise it will occur. Report every seed, including failures.

Use Gymnasium for CartPole rather than inventing a physics implementation.
Browser widgets can teach a simpler discrete environment without claiming to be
CartPole. Generative-action and world-model labs are tiny mechanism studies,
not reproductions of pi0, DINOv3, V-JEPA, VL-JEPA, or LeWorldModel benchmarks.

## Immediate corrections

- Reject identity-only, zero-output, missing-residual, and incorrect-attention
  solutions using executable reference comparisons, not source inspection.
- Label the old `grpo_loss` exercise as an introductory surrogate; keep its API
  stable and add the full clipped objective in the new RL track.
- Replace the claim that KL guarantees protection against reward hacking with
  the narrower drift/over-optimization role it actually serves.
- Do not infer universal superiority from GRPO, JEPA, scale, or a single seed.

## Release checks

- Curriculum graph: all prerequisites exist, no cycles, unique IDs, complete
  warm-ups and review entries, unchanged legacy progress and certificates.
- Graders: reference accepted, untouched starter rejected, targeted incorrect
  implementations rejected, edge cases and nonmutation checked where relevant.
- Experiments: standalone CPU execution, held-out metrics, masks and gradients,
  checkpoint continuation, generated notebooks fresh and independently runnable.
- Browser: complete new interactive lessons, run solutions in real Pyodide,
  inspect notebook/solution links, check desktop/mobile visuals and overflow.
- Build, independent code review, automated tests, and CI before a reviewable PR.
  Merge only when requested.
