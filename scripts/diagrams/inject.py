"""Inject diagram references into lesson markdown files.
Idempotent: won't add a reference that already exists.
"""
import io, re, os
from pathlib import Path

LESSONS = Path("C:/Himanshu/personal/coding/common_space/llm-quest/public/content/lessons")
IMAGES  = "content/images"  # relative to BASE_URL inside markdown

def read(p): return io.open(p, encoding="utf-8").read()
def write(p, s): io.open(p, "w", encoding="utf-8", newline="\n").write(s)

def inject(path, after_pattern, img_rel, alt):
    """Insert  \n![alt](img_rel)\n  after the first line matching after_pattern, if not already present."""
    s = read(path)
    tag = f"![{alt}]({img_rel})"
    if tag in s:
        return False
    # find the line
    lines = s.split("\n")
    pat = re.compile(after_pattern)
    for i, line in enumerate(lines):
        if pat.search(line):
            lines.insert(i + 1, f"\n{tag}\n")
            write(path, "\n".join(lines))
            return True
    print(f"  WARN: pattern {after_pattern!r} not found in {path.name}")
    return False

count = 0
def ins(rel_lesson, after, img_rel, alt):
    global count
    p = LESSONS / rel_lesson
    if not p.exists():
        print(f"  MISSING: {rel_lesson}")
        return
    if inject(p, after, f"{IMAGES}/{img_rel}", alt):
        count += 1

# C1
ins("c1/01_tensors.md",        r"^## Why tensors",         "c1/tensors_shapes.svg",    "Tensors and shapes")
ins("c1/03_tokenization.md",   r"^## The contract",        "c1/tokenizer_contract.svg","Tokenizer contract")
ins("c1/03_tokenization.md",   r"^## Level 3: byte-pair",  "c1/bpe_merges.svg",        "BPE merge steps")
ins("c1/04_data_pipeline.md",  r"^## Inputs and targets",  "c1/xy_windows.svg",        "Input and target windows")
ins("c1/05_bigram.md",         r"^## The smallest",        "c1/bigram_counts.svg",     "Bigram count matrix")
ins("c1/06_gradients.md",      r"^## The chain rule",      "c1/backprop_graph.svg",    "Backpropagation graph")
ins("c1/07_attention.md",      r"^## The equation",        "c1/attention_flow.svg",    "Attention computation")
ins("c1/07_attention.md",      r"^## Why causal masking",  "c1/causal_mask.svg",       "Causal attention mask")
ins("c1/08_transformer.md",    r"^## Residual stream",     "c1/transformer_stack.svg", "Transformer block stack")
ins("c1/90_debug_attention.md",r"^## The domain",          "c1/debug_mask_zero.svg",   "Effect of masking with 0 vs -inf")

# C2
ins("c2/01_rmsnorm.md",         r"^## LayerNorm first",     "c2/rmsnorm_vs_layernorm.svg","LayerNorm vs RMSNorm")
ins("c2/03_gqa.md",             r"^## The design axis",     "c2/gqa_heads.svg",           "MHA vs GQA vs MQA")
ins("c2/06_moe.md",             r"^# 06",                   "c2/moe_router.svg",          "Sparse MoE routing")
ins("c2/07_modern_block.md",    r"^# 07",                   "c2/modern_block.svg",        "Modern decoder block")
ins("c2/09_io_aware_attention.md",r"^## The apparent",      "c2/io_aware.svg",            "IO-aware attention tiling")
ins("c2/11_kv_cache.md",        r"^## Why caching works",   "c2/kv_cache_growth.svg",     "KV cache growth during decode")
ins("c2/90_debug_rmsnorm.md",   r"^## The domain",          "c2/debug_rmsnorm.svg",       "LayerNorm masquerading as RMSNorm")

# C3
ins("c3/01_encoder_only_bert.md",     r"^# 01",              "c3/bert_vs_gpt_mask.svg",   "Encoder vs decoder attention")
ins("c3/04_local_global_attention.md",r"^# 04",              "c3/local_global_masks.svg", "Local, global attention patterns")
ins("c3/05_sparse_moe.md",            r"^## The systems cost","c3/moe_systems_cost.svg",   "MoE routing across devices")
ins("c3/07_ssm_and_hybrids.md",       r"^## The tradeoff",   "c3/ssm_vs_attention.svg",   "SSM fixed state vs attention KV cache")
ins("c3/11_config_forensics.md",      r"^## Pass 1",         "c3/config_forensics.svg",   "Four-pass config forensics")
ins("c3/12_decision_defense.md",      r"^## Scenario",       "c3/decision_defense.svg",   "Architecture decision process")
ins("c3/90_debug_kv_budget.md",       r"^## The domain",     "c3/debug_kv_budget.svg",    "Query heads vs KV heads in cache budget")

# C4
ins("c4/03_baseline_and_instrumentation.md", r"^## Use the baseline",    "c4/baseline_control.svg",   "Baseline control experiment")
ins("c4/04_slos_and_budgets.md",             r"^## Latency budget",      "c4/latency_budget.svg",     "Latency budget bar")
ins("c4/05_placement_patterns.md",           r"^# 05",                   "c4/placement_spectrum.svg", "AI placement spectrum")
ins("c4/06_cost_and_capacity.md",            r"^## Offline versus online","c4/break_even.svg",         "Break-even request volume")
ins("c4/07_build_buy_model.md",              r"^## Hard gates",           "c4/build_buy.svg",          "Build-buy decision flow")
ins("c4/08_risk_and_governance.md",          r"^## Threat scenarios",     "c4/risk_matrix.svg",        "Risk priority matrix")
ins("c4/90_debug_precision.md",              r"^## The domain",           "c4/debug_precision.svg",    "Precision-at-k denominator")

# C5
ins("c5/01_lexical_bm25.md",             r"^# 01",              "c5/bm25_saturation.svg",    "BM25 term-frequency saturation")
ins("c5/02_dense_and_ann.md",            r"^## Exact versus",   "c5/ann_space.svg",          "ANN neighbor search")
ins("c5/03_hybrid_and_late_interaction.md",r"^# 03",            "c5/hybrid_fusion.svg",      "Hybrid retrieval fusion")
ins("c5/04_query_constraints.md",        r"^# 04",              "c5/query_constraints.svg",  "Hard vs soft query constraints")
ins("c5/05_reranking.md",                r"^# 05",              "c5/rerank_funnel.svg",      "Two-stage retrieval funnel")
ins("c5/07_grounded_generation.md",      r"^## Grounding has",  "c5/grounded_citations.svg", "Claim-level citations")
ins("c5/90_debug_topk.md",               r"^## The domain",     "c5/debug_topk.svg",         "Ascending vs descending argsort")

# C6
ins("c6/02_rubrics_and_agreement.md",  r"^## Agreement",       "c6/rubric_agreement.svg",    "Rubric scoring and annotator agreement")
ins("c6/03_metrics_and_uncertainty.md",r"^## Compare paired",  "c6/uncertainty_bars.svg",    "Metric confidence intervals")
ins("c6/04_calibration.md",            r"^## Reliability",     "c6/calibration_diagram.svg", "Reliability diagram / ECE")
ins("c6/05_llm_judges.md",             r"^## Known bias",      "c6/llm_judge_biases.svg",    "LLM judge known biases")
ins("c6/07_distillation.md",           r"^# 07",               "c6/distillation_flow.svg",   "Teacher-student distillation")
ins("c6/10_drift.md",                  r"^## Monitor leading", "c6/drift_leads_lags.svg",    "Leading vs lagging drift indicators")
ins("c6/90_debug_winrate.md",          r"^## The domain",      "c6/debug_winrate.svg",       "Counting ties as wins")

# C7
ins("c7/02_cache_and_decoding.md",         r"^## Why caching",       "c7/kv_cache_prefill.svg",       "Prefill vs decode phases")
ins("c7/03_latency_budgets.md",            r"^## The budget",        "c7/latency_stack.svg",          "Latency stack to first byte")
ins("c7/04_routing_and_backpressure.md",   r"^## Bound every",       "c7/observability_triangle.svg", "Observability three types")
ins("c7/05_observability.md",              r"^## Traces explain",    "c7/observability_triangle.svg", "Observability three types")
ins("c7/06_resilience.md",                 r"^## Circuit breaker",   "c7/circuit_breaker.svg",        "Circuit breaker state machine")
ins("c7/07_deployments.md",                r"^## Deployment stages", "c7/deployment_stages.svg",      "Progressive deployment stages")
ins("c7/90_debug_retry.md",               r"^## The domain",        "c7/retry_backoff.svg",          "Linear vs exponential backoff")

# C8
ins("c8/09_noninferiority.md",   r"^## Superiority vs",     "c8/noninferiority.svg",    "Superiority vs non-inferiority CIs")
ins("c8/11_artifact_ops.md",     r"^## The manifest$",      "c8/artifact_manifest.svg", "Artifact manifest fields")
ins("c8/90_debug_gate.md",       r"^## The domain",         "c8/debug_gate.svg",        "Upper vs lower CI in gating")

print(f"Injected {count} diagram references into lesson markdown files")
