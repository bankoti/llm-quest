# Coverage Crosswalk: Volume II and LLMs From Scratch

This is a map of **concept preparation**, not a claim to reproduce every paper,
answer unseen book figures, or train a frontier model on a laptop. The uploaded
excerpt contains 102 visible prompts; 1.8, 1.9, and 4.11 are not present.

Every new unit below has a registered interactive lesson, a browser coding
challenge, an independent grader, a worked reference solution, hints, review
questions, and a self-contained CPU notebook. Notebook experiments use original
synthetic datasets or simulated environment rollouts. Historical and
research-judgment prompts are discussion targets, not problems with an invented
uniquely correct answer.

## Recommended Path

1. Course 0 as needed, then Course 1 for tensor, language-model, and attention foundations.
2. Course 10 for a complete small-model training/adaptation workflow. Do this before treating a component exercise as a trained LLM.
3. Course 11 for optimization, generalization, and mechanism analysis.
4. Course 12 for policy gradients, real environment learning, group updates, and search.
5. Course 13 optionally extends those mechanisms to vision, action, and world models.

Courses 2-3 remain the architecture path; Courses 4-8 remain production AI
engineering; Course 9 remains frontier-training systems. Those paths and their
existing certificates are not retroactively gated by the new courses.

## Volume II

`C11.3` means Course 11, level 3. Both modes share the same unit title. File names
are listed in [the generated manifest](../public/content/expansion-manifest.json).

| Visible prompts | Concept | Preparation now included | Boundary |
| --- | --- | --- | --- |
| 1.1, 1.3 | ResNet discovery and depth degradation | C11.1-2; measured plain/residual depth sweeps and layer gradients | Toy target, not ImageNet replication |
| 1.2 | CNN operations | C13.1 convolution, activation, pooling explanation and actual CNN training | Single-channel browser contract |
| 1.4, 1.6, 1.7 | Parameter sweeps and landscapes | C11.2 two-parameter grid, finite differences, measured layer slice | A slice is not the full loss surface |
| 1.5 | Target likelihood and cross-entropy | Existing C1.4 plus stronger nonuniform grader; C10.2 | Natural-log convention explicit |
| 1.10, 1.11 | Residual updates and reframing | C11.1 | Historical interpretation is evidence-based discussion |
| 1.12 | Residual stream | Existing block lesson; strengthened C1.7 grader; C10.8 | Identity-only block now rejected |
| 1.13 | Computational path counts | C11.1 binomial counts and explorer | Shared paths are not independent models |
| 1.14, 1.15, 1.16 | Unraveling and ablation reasoning | C11.1 linear composition and nonlinear counterexample | Original examples replace book-specific diagrams |
| 1.17 | CNN versus Transformer | C13.1 | No universal winner claim |
| 1.18 | ViT artifacts and registers | C13.1 norm-map diagnostic and paper case | Injected toy artifact is labeled, not a pretrained-ViT measurement |
| 1.19 | Research-frontier judgment | C13.6 evidence ledger and defense | Discussion, not an automatically graded prediction |
| 2.1, 2.2 | Arithmetic-rule discovery | C11.3 exhaustive modular pairs and clock circuit | Referenced preceding-page panels are absent |
| 2.3 | Arithmetic learning versus language learning | C11.3 paired-data generalization; C10.8 | Transfer is an analogy, not identical task difficulty |
| 2.4, 2.11 | Grokking definition and discovery | C11.3 measured multi-seed trajectories | Short default does not promise grokking |
| 2.5 | Case-study architecture | C11.3 explicit paper setup versus smaller lab | Notebook MLP is not the paper Transformer |
| 2.6 | Linear probes | C11.4 and C10.4 actual frozen-feature training | Decodability is not causal use |
| 2.7, 2.8 | Clocks, trigonometry, Fourier circuits | C11.3-4 | Hand-built circuit distinguished from learned mechanism |
| 2.9 | Neuron activation grid | C11.4; experiment emits the measured grid | Color patterns alone are not proof |
| 2.10 | Restricted/excluded loss | C11.4 FFT intervention and measured losses | Declared illustrative frequencies, not automatic circuit discovery |
| 3.1, 3.2 | Robot-system progression and RT-2 | C13.3 architecture/interface comparison | Paper evidence, not a trained RT-2 replica |
| 3.3, 3.4 | pi0 components | C13.3 | Small conditional flow network, not pretrained VLM scale |
| 3.5 | Multimodal/action attention | C13.3 three-block mask and explorer | Cannot annotate an absent book figure literally |
| 3.6 | Continuous generative actions | C13.3 flow targets, actual velocity training, Euler integration | Declared linear noise-to-data path |
| 3.7, 3.8 | Inputs, outputs, and action communication | C13.3 state/action shapes and chunk semantics | No physical controller integration |
| 3.9 | VLA scaling and failures | C13.3, C13.6 | Simulation is not physical safety validation |
| 4.1, 4.8 | JEPA/JEA/generative distinctions | C13.4, C13.6 | Variants have different objectives |
| 4.2 | Self-supervision | Existing text objective plus C13.2 | Labels are generated from data, not absent supervision signals |
| 4.3, 4.4 | Language/video uncertainty and blur | C13.4 conditional-mean example and experiment | Latents do not remove all uncertainty |
| 4.5, 4.6 | Collapse and Barlow Twins | C13.2 objective, negative control, actual view learning | Small vector views, not a full image benchmark |
| 4.7 | DINOv3 | C13.2 Gram relations and primary-source case | Does not reproduce large-scale training/results |
| 4.9, 4.14, 4.15 | Robot control, PushT, world-model planning | C13.5-6 learned action-conditioned dynamics and planning | Linear-state lab is not PushT/contact physics or pixel training |
| 4.10, 4.12 | Encoder swaps, V-JEPA/CLIP, VL-JEPA | C13.6 comparison design and primary sources | Matched comparisons, not universal ranking |
| 4.13, 4.16, 4.17 | VLA/JEPA limits, long horizons | C13.4-6 model error, replanning, hierarchy | Hierarchical control is explained, not a full robot stack |
| 4.18 | Future architectures | C13.6 defense | Open discussion |
| 5.1, 5.2 | Overfitting | Existing validation plus C11.5 | Training and test error both reported |
| 5.3 | Bias/variance and U-shaped error | C11.5 repeated-data polynomial decomposition | Empirical noiseless-target decomposition stated |
| 5.4 | AlexNet regularization | C13.1 historical dropout/augmentation case | Existing dropout teaching retained; no ImageNet training |
| 5.5 | Random-label fitting | C11.5 discussion and experiment control | Memorization is not task generalization |
| 5.6, 5.7, 5.8 | Double descent and interpolation | C11.5 capacity/noise/ridge sweeps | Curve shape is measured, not guaranteed |
| 5.9, 5.10, 5.11 | Polynomial interpolation and regularization | C11.5 minimum-norm solver, polynomial sweeps, ridge | Numerical conditioning is disclosed |
| 5.12 | Double descent versus grokking | C11.3 and C11.5 | Different axes and claims |
| 5.13 | Why overfitting still matters | C11.5 | Interpolation does not waive held-out evaluation |
| 6.1, 6.2, 6.3 | HARPY and phone grammars | C11.6 grammar expansion and prefix counts | Original grammar, not copied book solutions |
| 6.4, 6.5 | HMMs and Bitter Lesson history | C11.6 Viterbi and historical reading | Phone graph distinguished from probabilistic HMM |
| 6.6, 6.7 | Scaling and its limits | C11.6 plus existing C9.1 | Finite product constraints remain relevant |
| 6.8 | Supervised versus RL signals | C12.1-3 | Imitation gradients and real reward-based updates |
| 6.9 | Go search complexity | C12.6 branching calculation | Tiny exact tree, not a Go engine |
| 6.10, 6.11 | Imitation and limitations | C12.1, C12.6 | Rollout shift and policy/value/search roles |
| 6.12 | AlphaGo interaction | C12.6 PUCT-style selection and backup | Teaching PUCT convention explicitly stated |
| 6.13 | RL in LLM training | C12.3-5 plus existing alignment lessons | Text-prefix/action mapping and verifier limitations |
| 6.14 | Pre-1900 corpus counterfactual | C11.6, C13.6 discussion rubric | Not a settled yes/no claim |
| 6.15 | RL challenges | C12.1-5 | Exploration, variance, sparse credit, reward attacks |
| 7.1 | Offline learning and shift | C12.1 | Compounding-error toy assumptions disclosed |
| 7.2 | CartPole interaction | C12.3 actual Gymnasium rollouts and training | Does not reproduce the missing external HTML |
| 7.3, 7.4 | Sigmoid policies and boundaries | C12.1 live parameter explorer and code | Toy policy coordinates versus full four-state environment |
| 7.5, 7.6 | L1 imitation gradients | C12.1 hand, finite-difference, and autograd checks | L1 is not silently replaced by cross-entropy |
| 7.7 | Gradient updates | Existing gradients plus C12.1 | Original worked numeric example |
| 7.8 | Chosen-action confidence | C12.1 L1 = 1 - demonstrated-action probability | Binary-action assumption stated |
| 7.9 | Supervision versus reward | C12.1-3 | Both update mechanisms execute |
| 7.10 | Model-free policy gradients | C12.2 derivation | Environment independent of policy parameters |
| 7.11 | Stochastic policies | C12.1-3 | Exploration is useful, not sufficient |
| 7.12, 7.13, 7.14, 7.15 | Trajectory probabilities and gradients | C12.2 stable log scores and derivative checks | Fixed-transition toy versus sampled environment distinguished |
| 7.16 | Policy-gradient estimator | C12.2 exact enumeration, finite differences, Monte Carlo | Baseline assumptions explicit |
| 7.17 | Sparse supervision and efficiency | C12.2-3 variance and sparse-reward transfer | No guaranteed sample-efficiency winner |
| 7.18 | Bridge to reasoning-model RL | C12.3-5 | Environment/LM state-action-return mapping |
| 7.19 | GRPO versus vanilla PG | C12.4 real updates at matched total samples/steps | Group size/reuse and FLOP differences disclosed |
| 7.20 | GRPO failure | C12.4-5 zero-variance groups and flawed-reward experiment | KL does not validate the verifier |

## LLMs From Scratch

Reference: [Sebastian Raschka's official repository](https://github.com/rasbt/LLMs-from-scratch).
The goal is equivalent capability coverage with original exercises, not a copy
of the book or a claim that every bonus notebook is required.

| Area | Existing material retained | Addition / decision |
| --- | --- | --- |
| LLM concepts, Python, tensors | Toolkit, C1, interactive foundations | No duplicate full Python course |
| Text IDs, tokenization, embeddings, context windows | C1.1-3 and token lessons | C10.1 complete deterministic byte-BPE lifecycle; special-token boundary risks explained |
| Attention and causal multi-head blocks | C1.6-7, C2, interactive Transformer | Strong numerical graders reject identity/uniform shortcuts |
| Complete GPT | Existing vendored mini_llm | C10.8 full NumPy decoder and connected Torch training run |
| Pretraining, validation, sampling | Existing training/generation lessons | C10.2, C10.7-8 measured CPU training, accumulation, clipping, schedules, evaluation |
| Save/load and pretrained import | Existing inference checkpoints/configs | C10.3 actual serialized resume plus explicit local foreign-weight fixture |
| Classification fine-tuning | Previously incomplete learner path | C10.4 actual frozen-backbone head training, pooling and macro F1 |
| Instruction fine-tuning | Existing SFT/alignment overview | C10.5 response/EOS masking, collation, actual SFT, held-out exact match |
| Training refinements | Existing optimizer basics | C10.2-3 token accounting and recovery; core experiment proves gradient equivalence |
| LoRA | Existing interactive explanation | C10.6 coding, real adapter updates, frozen-base checks, merge equivalence |
| Full-size downloaded GPT weights | Optional network-dependent example | Not required; local shape/orientation fixture teaches import safely without a large download |
| Distributed frameworks and GPUs | Existing ZeRO/FlashAttention/system labs | Retain advanced optional paths; do not make paid hardware a prerequisite |
| Every current architecture/vendor API | Existing architecture atlas | Not a finite from-scratch requirement; mechanisms matter more than a changing catalog |

## What Remains Intentionally Outside the Claim

- Exact answers to absent book figures and external code are not fabricated.
- Main coding problems have worked executable solutions. Open transfer problems
  use an evidence rubric because experiment outcomes vary; no successful result
  is invented to serve as an answer key.
- Grokking, DINOv3, pi0, V-JEPA, VL-JEPA, and LeWorldModel benchmark reproduction
  is not claimed. The course teaches mechanisms, small measured experiments,
  and how to read the primary evidence.
- Physical robot deployment, human safety, frontier-scale pretraining, and
  independent production approval remain outside these CPU labs.
