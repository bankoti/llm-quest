// Curriculum: 8 courses, 49 challenge levels + lessons
// XP calibrated: harder = more. Boss fights = 3x normal.
// challengeFile: path to the numpy/pure-python challenge (C1-3)
//   or the mini_llm workbook (C4-8)
// runtime: 'pyodide' for all (C1-3 use numpy rewrites, C4-8 use mini_llm bundle)

export type LevelType = 'challenge' | 'boss' | 'debug'

export interface Level {
  id: string              // e.g. "c1-l1"
  courseId: number
  index: number           // position within course, 1-based
  title: string
  description: string
  xp: number
  type: LevelType
  lessonFile: string      // path under /content/lessons/
  challengeFile: string   // path under /content/challenges/
  estimateMinutes: number
}

export interface Course {
  id: number
  slug: string
  title: string
  shortTitle: string
  color: string           // Tailwind color name used for world theming
  accent: string          // hex for SVG/canvas use
  levels: Level[]
  prerequisite: number | null
}

export const COURSES: Course[] = [
  {
    id: 1,
    slug: 'build-an-llm',
    title: 'Build an LLM From First Principles',
    shortTitle: 'Build an LLM',
    color: 'violet',
    accent: '#7c3aed',
    prerequisite: null,
    levels: [
      { id:'c1-l1', courseId:1, index:1, title:'Tensors & Shapes',       description:'Read tensor operations that power every model.',              xp:100, type:'challenge', lessonFile:'c1/01_tensors.md',         challengeFile:'c1/01_tensors.py',         estimateMinutes:20 },
      { id:'c1-l2', courseId:1, index:2, title:'Tokenization',           description:'Build character and byte-level BPE tokenizers.',              xp:120, type:'challenge', lessonFile:'c1/03_tokenization.md',     challengeFile:'c1/02_tokenizer.py',       estimateMinutes:25 },
      { id:'c1-l3', courseId:1, index:3, title:'Data & Batching',        description:'Construct context-target training batches.',                  xp:100, type:'challenge', lessonFile:'c1/04_data_pipeline.md',    challengeFile:'c1/03_batches.py',         estimateMinutes:20 },
      { id:'c1-l4', courseId:1, index:4, title:'The Bigram Baseline',    description:'Train the smallest useful language model.',                   xp:120, type:'challenge', lessonFile:'c1/05_bigram.md',           challengeFile:'c1/04_bigram.py',          estimateMinutes:25 },
      { id:'c1-l5', courseId:1, index:5, title:'Gradients & Optimization','description':'Understand how loss flows back to weights.',               xp:150, type:'challenge', lessonFile:'c1/06_gradients.md',        challengeFile:'c1/05_gradients.py',       estimateMinutes:30 },
      { id:'c1-l6', courseId:1, index:6, title:'Causal Self-Attention',  description:'Implement scaled dot-product attention with causal masking.',  xp:200, type:'challenge', lessonFile:'c1/07_attention.md',        challengeFile:'c1/06_attention.py',       estimateMinutes:35 },
      { id:'c1-d1', courseId:1, index:7, title:'Debug: Leaky Attention', description:'An AI wrote this causal attention. Something leaks from the future.', xp:150, type:'debug', lessonFile:'c1/90_debug_attention.md', challengeFile:'c1/90_debug_attention.py', estimateMinutes:25 },
      { id:'c1-l7', courseId:1, index:7, title:'The Transformer',        description:'Assemble a GPT-style decoder from scratch.',                  xp:500, type:'boss',      lessonFile:'c1/08_transformer.md',      challengeFile:'c1/07_transformer.py',     estimateMinutes:60 },
    ],
  },
  {
    id: 2,
    slug: 'modern-transformer',
    title: 'Modern Transformer Components',
    shortTitle: 'Modern Transformer',
    color: 'blue',
    accent: '#2563eb',
    prerequisite: 1,
    levels: [
      { id:'c2-l1', courseId:2, index:1, title:'RMSNorm & RoPE',         description:'Replace LayerNorm and add rotary position embeddings.',        xp:150, type:'challenge', lessonFile:'c2/01_rmsnorm.md',          challengeFile:'c2/01_norm_and_rope.py',   estimateMinutes:30 },
      { id:'c2-l2', courseId:2, index:2, title:'Grouped-Query Attention', description:'Share key/value heads to cut KV cache size.',                 xp:150, type:'challenge', lessonFile:'c2/03_gqa.md',              challengeFile:'c2/02_gqa_and_masks.py',   estimateMinutes:30 },
      { id:'c2-l3', courseId:2, index:3, title:'Sparse MoE',             description:'Route tokens to experts; activate only a fraction.',          xp:200, type:'challenge', lessonFile:'c2/06_moe.md',              challengeFile:'c2/03_sparse_moe.py',      estimateMinutes:35 },
      { id:'c2-l4', courseId:2, index:4, title:'The Modern Block',       description:'Assemble the full Llama/Mistral-style decoder block.',         xp:400, type:'boss',      lessonFile:'c2/07_modern_block.md',     challengeFile:'c2/04_modern_decoder.py',  estimateMinutes:50 },
      { id:'c2-l5', courseId:2, index:5, title:'IO-Aware Attention',     description:'Derive why FlashAttention rewrites are memory-bandwidth wins.', xp:200, type:'challenge', lessonFile:'c2/09_io_aware_attention.md',challengeFile:'c2/05_flash_io.py',        estimateMinutes:35 },
      { id:'c2-l6', courseId:2, index:6, title:'KV Cache Arithmetic',    description:'Calculate cache size, eviction, and speculative budgets.',     xp:200, type:'challenge', lessonFile:'c2/11_kv_cache.md',         challengeFile:'c2/06_kv_cache.py',        estimateMinutes:35 },
      { id:'c2-d1', courseId:2, index:7, title:'Debug: The Norm That Centers', description:'This RMSNorm passes a quick glance. The paper disagrees.', xp:150, type:'debug', lessonFile:'c2/90_debug_rmsnorm.md', challengeFile:'c2/90_debug_rmsnorm.py', estimateMinutes:25 },
    ],
  },
  {
    id: 3,
    slug: 'architecture-atlas',
    title: 'Open Model Architecture Atlas',
    shortTitle: 'Architecture Atlas',
    color: 'cyan',
    accent: '#0891b2',
    prerequisite: 2,
    levels: [
      { id:'c3-l1', courseId:3, index:1, title:'Information Flow',        description:'Trace data through encoder, decoder, and hybrid architectures.', xp:150, type:'challenge', lessonFile:'c3/01_encoder_only_bert.md', challengeFile:'c3/01_information_flow.py',   estimateMinutes:30 },
      { id:'c3-l2', courseId:3, index:2, title:'Attention Topology',      description:'Compare full, local, sparse, and cross-attention patterns.',     xp:150, type:'challenge', lessonFile:'c3/04_local_global_attention.md', challengeFile:'c3/02_attention_topology.py', estimateMinutes:30 },
      { id:'c3-l3', courseId:3, index:3, title:'Capacity & Compute',      description:'Calculate FLOPs, parameter counts, and memory envelopes.',      xp:200, type:'challenge', lessonFile:'c3/05_sparse_moe.md',       challengeFile:'c3/03_capacity_compute.py',   estimateMinutes:35 },
      { id:'c3-l4', courseId:3, index:4, title:'State Space Models',      description:'Derive the SSM recurrence and compare to attention complexity.', xp:200, type:'challenge', lessonFile:'c3/07_ssm_and_hybrids.md',  challengeFile:'c3/04_state_space.py',        estimateMinutes:35 },
      { id:'c3-l5', courseId:3, index:5, title:'Config Forensics',        description:'Read a real model config and derive architecture facts.',        xp:150, type:'challenge', lessonFile:'c3/11_config_forensics.md', challengeFile:'c3/05_config_audit.py',       estimateMinutes:25 },
      { id:'c3-d1', courseId:3, index:6, title:'Debug: KV Cache Overcount', description:'The memory estimate says GQA saves nothing. That cannot be right.', xp:150, type:'debug', lessonFile:'c3/90_debug_kv_budget.md', challengeFile:'c3/90_debug_kv_budget.py', estimateMinutes:25 },
      { id:'c3-l6', courseId:3, index:6, title:'Architecture Defense',    description:'Justify an architecture choice against three alternatives.',    xp:500, type:'boss',      lessonFile:'c3/12_decision_defense.md', challengeFile:'c3/06_state_budget.py',       estimateMinutes:60 },
    ],
  },
  {
    id: 4,
    slug: 'solution-architecture',
    title: 'AI Solution Architecture',
    shortTitle: 'Solution Architecture',
    color: 'emerald',
    accent: '#059669',
    prerequisite: 3,
    levels: [
      { id:'c4-l1', courseId:4, index:1, title:'Route Decision',         description:'Choose where AI belongs in a stack before choosing a model.',  xp:150, type:'challenge', lessonFile:'c4/05_placement_patterns.md', challengeFile:'c4/01_route_decision.py',    estimateMinutes:30 },
      { id:'c4-l2', courseId:4, index:2, title:'Baseline Report',        description:'Instrument and measure a classical baseline.',                 xp:150, type:'challenge', lessonFile:'c4/03_baseline_and_instrumentation.md', challengeFile:'c4/02_baseline_report.py', estimateMinutes:30 },
      { id:'c4-l3', courseId:4, index:3, title:'SLO Budget',             description:'Allocate latency and error budgets across components.',        xp:200, type:'challenge', lessonFile:'c4/04_slos_and_budgets.md',  challengeFile:'c4/03_slo_budget.py',        estimateMinutes:35 },
      { id:'c4-l4', courseId:4, index:4, title:'Architecture Scorecard', description:'Score four patterns against your constraints.',               xp:150, type:'challenge', lessonFile:'c4/07_build_buy_model.md',   challengeFile:'c4/04_architecture_scorecard.py', estimateMinutes:25 },
      { id:'c4-l5', courseId:4, index:5, title:'Cost Break-Even',        description:'Calculate when AI cost justifies quality improvement.',       xp:200, type:'challenge', lessonFile:'c4/06_cost_and_capacity.md', challengeFile:'c4/05_cost_break_even.py',   estimateMinutes:35 },
      { id:'c4-d1', courseId:4, index:6, title:'Debug: Flattering Precision', description:'This metric gives everyone an A. Find out why.', xp:150, type:'debug', lessonFile:'c4/90_debug_precision.md', challengeFile:'c4/90_debug_precision.py', estimateMinutes:25 },
      { id:'c4-l6', courseId:4, index:6, title:'Risk Register',          description:'Identify failure modes before they become incidents.',        xp:500, type:'boss',      lessonFile:'c4/08_risk_and_governance.md', challengeFile:'c4/06_risk_register.py',   estimateMinutes:55 },
    ],
  },
  {
    id: 5,
    slug: 'retrieval-and-rag',
    title: 'Retrieval, Search, and Grounded Generation',
    shortTitle: 'Retrieval & RAG',
    color: 'amber',
    accent: '#d97706',
    prerequisite: 4,
    levels: [
      { id:'c5-l1', courseId:5, index:1, title:'BM25 Math',             description:'Derive term-frequency scoring from first principles.',         xp:150, type:'challenge', lessonFile:'c5/01_lexical_bm25.md',      challengeFile:'c5/01_bm25_math.py',        estimateMinutes:30 },
      { id:'c5-l2', courseId:5, index:2, title:'Dense Similarity',      description:'Build a two-tower embedding retriever.',                      xp:150, type:'challenge', lessonFile:'c5/02_dense_and_ann.md',     challengeFile:'c5/02_dense_similarity.py', estimateMinutes:30 },
      { id:'c5-l3', courseId:5, index:3, title:'Hybrid Rank Fusion',    description:'Combine lexical and dense scores with RRF.',                  xp:200, type:'challenge', lessonFile:'c5/03_hybrid_and_late_interaction.md', challengeFile:'c5/03_rank_fusion.py', estimateMinutes:35 },
      { id:'c5-l4', courseId:5, index:4, title:'Constrained Search',    description:'Parse intent and apply hard filters before ranking.',         xp:200, type:'challenge', lessonFile:'c5/04_query_constraints.md', challengeFile:'c5/04_constrained_search.py', estimateMinutes:35 },
      { id:'c5-l5', courseId:5, index:5, title:'Reranking',             description:'Score candidates with a cross-encoder, apply business rules.', xp:150, type:'challenge', lessonFile:'c5/05_reranking.md',         challengeFile:'c5/05_rerank.py',           estimateMinutes:25 },
      { id:'c5-d1', courseId:5, index:6, title:'Debug: Backwards Ranking', description:'The retriever confidently returns the worst documents first.', xp:150, type:'debug', lessonFile:'c5/90_debug_topk.md', challengeFile:'c5/90_debug_topk.py', estimateMinutes:25 },
      { id:'c5-l6', courseId:5, index:6, title:'Grounded Generation',   description:'Ground LLM output in retrieved context; validate citations.', xp:500, type:'boss',      lessonFile:'c5/07_grounded_generation.md', challengeFile:'c5/06_citation_validation.py', estimateMinutes:55 },
    ],
  },
  {
    id: 6,
    slug: 'data-eval-distillation',
    title: 'Data, Evaluation & Distillation',
    shortTitle: 'Eval & Distillation',
    color: 'rose',
    accent: '#e11d48',
    prerequisite: 5,
    levels: [
      { id:'c6-l1', courseId:6, index:1, title:'NDCG & Ranking Metrics', description:'Measure retrieval quality with position-discounted gain.',    xp:150, type:'challenge', lessonFile:'c6/03_metrics_and_uncertainty.md', challengeFile:'c6/01_ndcg.py',           estimateMinutes:30 },
      { id:'c6-l2', courseId:6, index:2, title:'Distil a Student',       description:'Train a compact model to mimic a teacher on relevance.',     xp:200, type:'challenge', lessonFile:'c6/07_distillation.md',       challengeFile:'c6/02_distill_student.py', estimateMinutes:40 },
      { id:'c6-l3', courseId:6, index:3, title:'Calibration & ECE',      description:'Measure and fix confidence vs. accuracy mismatch.',          xp:150, type:'challenge', lessonFile:'c6/04_calibration.md',        challengeFile:'c6/03_calibration.py',     estimateMinutes:30 },
      { id:'c6-l4', courseId:6, index:4, title:'Judge Order Bias',       description:'Audit an LLM judge for position and verbosity bias.',        xp:200, type:'challenge', lessonFile:'c6/05_llm_judges.md',         challengeFile:'c6/04_judge_bias.py',      estimateMinutes:35 },
      { id:'c6-l5', courseId:6, index:5, title:'Inter-Rater Agreement',  description:'Compute Cohen\'s κ and diagnose rubric failures.',            xp:150, type:'challenge', lessonFile:'c6/02_rubrics_and_agreement.md', challengeFile:'c6/05_agreement.py',     estimateMinutes:25 },
      { id:'c6-d1', courseId:6, index:6, title:'Debug: The Generous Judge', description:'Model A never loses. The judge has a thumb on the scale.', xp:150, type:'debug', lessonFile:'c6/90_debug_winrate.md', challengeFile:'c6/90_debug_winrate.py', estimateMinutes:25 },
      { id:'c6-l6', courseId:6, index:6, title:'Drift Detection',        description:'Detect distribution shift before it silently degrades quality.', xp:500, type:'boss',  lessonFile:'c6/10_drift.md',              challengeFile:'c6/06_drift.py',           estimateMinutes:55 },
    ],
  },
  {
    id: 7,
    slug: 'serving-and-llmops',
    title: 'Inference Serving, LLMOps & Reliability',
    shortTitle: 'LLMOps',
    color: 'orange',
    accent: '#ea580c',
    prerequisite: 6,
    levels: [
      { id:'c7-l1', courseId:7, index:1, title:'Fallback Behavior',      description:'Return a valid response when every AI component is down.',    xp:200, type:'challenge', lessonFile:'c7/06_resilience.md',         challengeFile:'c7/01_fallback.py',        estimateMinutes:35 },
      { id:'c7-l2', courseId:7, index:2, title:'Cache Identity',         description:'Version artifact identities so rollback never breaks state.', xp:150, type:'challenge', lessonFile:'c7/02_cache_and_decoding.md',        challengeFile:'c7/02_cache_identity.py',  estimateMinutes:25 },
      { id:'c7-l3', courseId:7, index:3, title:'Token & Deadline Budget', description:'Propagate deadlines; cut work before exceeding the budget.',  xp:200, type:'challenge', lessonFile:'c7/03_latency_budgets.md', challengeFile:'c7/03_token_deadline.py',  estimateMinutes:35 },
      { id:'c7-l4', courseId:7, index:4, title:'Circuit Breaker',        description:'Open a circuit when downstream latency crosses a threshold.', xp:200, type:'challenge', lessonFile:'c7/05_observability.md',         challengeFile:'c7/04_circuit_breaker.py', estimateMinutes:35 },
      { id:'c7-l5', courseId:7, index:5, title:'Overload Admission',     description:'Shed load gracefully; never queue work you cannot serve.',   xp:150, type:'challenge', lessonFile:'c7/04_routing_and_backpressure.md', challengeFile:'c7/05_admission.py',  estimateMinutes:25 },
      { id:'c7-d1', courseId:7, index:6, title:'Debug: Retry Storm', description:'The retry logic looks polite. Under an outage it becomes a mob.', xp:150, type:'debug', lessonFile:'c7/90_debug_retry.md', challengeFile:'c7/90_debug_retry.py', estimateMinutes:25 },
      { id:'c7-l6', courseId:7, index:6, title:'Canary Gate',            description:'Block a rollout automatically when error rate spikes.',       xp:500, type:'boss',      lessonFile:'c7/07_deployments.md',        challengeFile:'c7/06_canary_gate.py',     estimateMinutes:55 },
    ],
  },
  {
    id: 8,
    slug: 'production-capstone',
    title: 'Production AI Engineering Capstone',
    shortTitle: 'Capstone',
    color: 'fuchsia',
    accent: '#a21caf',
    prerequisite: 7,
    levels: [
      { id:'c8-l1', courseId:8, index:1, title:'Experiment Design',      description:'Define a causal launch experiment with guardrails.',          xp:200, type:'challenge', lessonFile:'c8/10_product_experiment.md', challengeFile:'c8/01_experiment.py',      estimateMinutes:35 },
      { id:'c8-l2', courseId:8, index:2, title:'Launch Gate',            description:'Pass/fail a release on evidence, not opinion.',               xp:200, type:'challenge', lessonFile:'c8/08_operational_readiness.md', challengeFile:'c8/02_launch_gate.py',  estimateMinutes:35 },
      { id:'c8-l3', courseId:8, index:3, title:'Non-Inferiority Test',   description:'Prove a new model does not regress on critical slices.',      xp:200, type:'challenge', lessonFile:'c8/09_noninferiority.md', challengeFile:'c8/03_noninferiority.py',  estimateMinutes:35 },
      { id:'c8-l4', courseId:8, index:4, title:'Artifact Manifest',      description:'Version every dependency so the build is fully reproducible.', xp:150, type:'challenge', lessonFile:'c8/11_artifact_ops.md', challengeFile:'c8/04_artifact_manifest.py', estimateMinutes:25 },
      { id:'c8-l5', courseId:8, index:5, title:'Failure Matrix',         description:'Map every failure mode to a bounded, verified control.',      xp:200, type:'challenge', lessonFile:'c8/07_failure_campaign.md',   challengeFile:'c8/05_failure_matrix.py',  estimateMinutes:35 },
      { id:'c8-d1', courseId:8, index:6, title:'Debug: The Confident Gate', description:'This rollout gate approves anything uncertain. Uncertain is not safe.', xp:150, type:'debug', lessonFile:'c8/90_debug_gate.md', challengeFile:'c8/90_debug_gate.py', estimateMinutes:25 },
      { id:'c8-l6', courseId:8, index:6, title:'Final Defense',          description:'Ship, break, fix, and defend the complete system.',           xp:1000,type:'boss',      lessonFile:'c8/12_change_and_defense.md', challengeFile:'c8/06_incident_timing.py', estimateMinutes:90 },
    ],
  },
  {
    id: 9,
    slug: 'frontier-models',
    title: 'Frontier Model Training',
    shortTitle: 'Frontier Models',
    color: 'rose',
    accent: '#e11d48',
    prerequisite: 3,
    levels: [
      { id:'c9-l1', courseId:9, index:1, title:'Scaling Laws',            description:'Derive compute-optimal parameter and token counts from first principles.',   xp:150, type:'challenge', lessonFile:'c9/01_scaling_laws.md',    challengeFile:'c9/01_scaling_laws.py',    estimateMinutes:30 },
      { id:'c9-l2', courseId:9, index:2, title:'Data Pipeline',           description:'Estimate token retention, domain mix, and embedding costs.',               xp:150, type:'challenge', lessonFile:'c9/02_data_pipeline.md',   challengeFile:'c9/02_data_pipeline.py',   estimateMinutes:25 },
      { id:'c9-l3', courseId:9, index:3, title:'DPO Loss',                description:'Implement the Direct Preference Optimization loss from the paper.',        xp:200, type:'challenge', lessonFile:'c9/03_alignment.md',       challengeFile:'c9/03_dpo_loss.py',        estimateMinutes:35 },
      { id:'c9-l4', courseId:9, index:4, title:'GRPO Advantages',         description:'Compute group-relative advantages used in DeepSeek-R1 reasoning RL.',     xp:200, type:'challenge', lessonFile:'c9/04_reasoning_rl.md',    challengeFile:'c9/04_grpo.py',            estimateMinutes:35 },
      { id:'c9-l5', courseId:9, index:5, title:'Frontier Config Audit',   description:'Derive parameter counts and KV cache from Llama 3 / DeepSeek configs.',   xp:200, type:'challenge', lessonFile:'c9/05_frontier_configs.md', challengeFile:'c9/05_frontier_audit.py', estimateMinutes:35 },
      { id:'c9-d1', courseId:9, index:6, title:'Debug: Budget That Forgot Inference', description:'The Chinchilla formula is correct. The objective is wrong.', xp:150, type:'debug', lessonFile:'c9/90_debug_scaling.md', challengeFile:'c9/90_debug_scaling.py', estimateMinutes:25 },
      { id:'c9-l6', courseId:9, index:6, title:'Training Recipe Defense', description:'Design a full training recipe that satisfies compute, memory, and alignment constraints.', xp:1000, type:'boss', lessonFile:'c9/06_training_recipe.md', challengeFile:'c9/06_training_recipe.py', estimateMinutes:75 },
    ],
  },
]

// Flat list of all levels in order
export const ALL_LEVELS: Level[] = COURSES.flatMap(c => c.levels)

// Total XP possible
export const MAX_XP = ALL_LEVELS.reduce((sum, l) => sum + l.xp, 0)

// XP → rank title
export const XP_RANKS = [
  { minXp: 0,    title: 'Novice',          color: '#6b7280' },
  { minXp: 200,  title: 'Engineer I',      color: '#7c3aed' },
  { minXp: 600,  title: 'Engineer II',     color: '#2563eb' },
  { minXp: 1200, title: 'Senior Engineer', color: '#059669' },
  { minXp: 2500, title: 'Staff Engineer',  color: '#d97706' },
  { minXp: 4000, title: 'Principal',       color: '#e11d48' },
  { minXp: 6000, title: 'Distinguished',   color: '#a21caf' },
] as const

export function getRank(xp: number) {
  return [...XP_RANKS].reverse().find(r => xp >= r.minXp) ?? XP_RANKS[0]
}

export function getCourse(courseId: number) {
  return COURSES.find(c => c.id === courseId)!
}

export function getLevel(levelId: string) {
  return ALL_LEVELS.find(l => l.id === levelId)
}
