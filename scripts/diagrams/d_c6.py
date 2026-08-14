"""Course 6, 7, 8 diagrams: evaluation, production systems, capstone."""
from svgkit import *

# --- C6: Evaluation ---

def rubric_agreement(out):
    s = SVG(720, 270, "Rubric scoring and annotator agreement (κ)")
    s.rect(56, 60, 260, 140, fill=BG, stroke=BORDER, rx=10)
    s.text(186, 82, "example rubric row", size=12, color=TEXT, weight="600")
    rows = [("relevance 1–5", "does the answer address the question?"),
            ("faithfulness 0/1", "every claim verifiable from sources?"),
            ("conciseness 1–3", "any unnecessary padding?")]
    for i, (k, v) in enumerate(rows):
        s.text(70, 104 + i * 32, k, size=10.5, color=CYAN, anchor="start", mono=True)
        s.text(70, 118 + i * 32, v, size=10, color=MUTED, anchor="start")
    s.box(375, 70, 90, 50, "annot A", VIOLET)
    s.box(510, 70, 90, 50, "annot B", EMERALD)
    s.grid(375, 140, 45, 4, 2,
           values=[[3, 3], [1, 1], [5, 4], [2, 3]],
           colors=[[(EMERALD + "26" if a == b else AMBER + "26") for a, b in [(3, 3), (1, 1), (5, 4), (2, 3)]] * 1 for _ in range(4)],
           labels_left=["ex 1", "ex 2", "ex 3", "ex 4"])
    s.text(552, 152, "✓", size=14, color=EMERALD); s.text(552, 196, "✓", size=14, color=EMERALD)
    s.text(552, 174, "κ ≈ 0.73", size=11, color=AMBER, mono=True); s.text(552, 218, "disagree", size=11, color=AMBER, mono=True)
    s.text(360, 252, "low κ means the rubric itself is ambiguous — fix the rubric before collecting more labels", size=11.5, color=MUTED)
    s.save(out)

def uncertainty_bars(out):
    s = SVG(720, 270, "Metric + confidence interval: is the gap real?")
    x0, y0 = s.axis(80, 60, 540, 160, xlabel="", ylabel="quality score")
    models = [("baseline", 0.61, 0.08, FAINT), ("v2", 0.67, 0.04, CYAN), ("v3", 0.65, 0.22, AMBER)]
    for i, (nm, m, e, col) in enumerate(models):
        x = x0 + 80 + i * 160
        s.rect(x - 20, y0 - m * 150, 40, m * 150, fill=col + "33", stroke=col, rx=4)
        s.line(x, y0 - (m + e) * 150, x, y0 - (m - e) * 150, color=col, sw=3)
        s.line(x - 8, y0 - (m + e) * 150, x + 8, y0 - (m + e) * 150, color=col, sw=2)
        s.line(x - 8, y0 - (m - e) * 150, x + 8, y0 - (m - e) * 150, color=col, sw=2)
        s.text(x, y0 + 18, nm, size=11, color=col, mono=True)
    s.text(360, 250, "v3 looks higher than baseline but the CI spans both — with n=20 this gap is noise", size=11.5, color=MUTED)
    s.save(out)

def calibration_diagram(out):
    s = SVG(720, 280, "Reliability diagram: are confidence scores honest?")
    x0, y0 = s.axis(80, 60, 540, 160, xlabel="model confidence", ylabel="actual accuracy")
    # perfect calibration line
    s.poly([(x0, y0), (x0 + 540, y0 - 160)], color=FAINT, dash="6,4")
    s.text(x0 + 430, y0 - 140, "perfect calibration", size=10.5, color=FAINT)
    # overconfident
    ovpts = [(x0, y0), (x0 + 108, y0 - 80), (x0 + 270, y0 - 96), (x0 + 432, y0 - 112), (x0 + 540, y0 - 122)]
    s.poly(ovpts, color=ROSE, sw=2.2)
    s.text(x0 + 420, y0 - 68, "overconfident model", size=11, color=ROSE)
    # underconfident
    unpcts = [(x0, y0 - 10), (x0 + 108, y0 - 48), (x0 + 270, y0 - 112), (x0 + 432, y0 - 152), (x0 + 540, y0 - 160)]
    s.poly(unpcts, color=VIOLET, sw=2.2)
    s.text(x0 + 60, y0 - 80, "underconfident", size=11, color=VIOLET)
    s.text(360, 262, "ECE = area between the model curve and the diagonal — the further apart, the less you can trust the score", size=11, color=MUTED)
    s.save(out)

def llm_judge_biases(out):
    s = SVG(720, 270, "Known LLM judge biases — probe before deploying")
    biases = [
        ("position bias",       "prefers response A\n(presented first)", ROSE),
        ("verbosity bias",      "longer = better,\neven when redundant", AMBER),
        ("self-enhancement",    "prefers outputs from\nits own model family", VIOLET),
        ("sycophancy",          "told B is better →\nflips to B", BLUE),
    ]
    for i, (name, body, col) in enumerate(biases):
        x = 40 + i * 170
        s.rect(x, 60, 148, 110, fill=col + "14", stroke=col, rx=10)
        s.text(x + 74, 84, name, size=11, color=col, weight="600")
        for j, ln in enumerate(body.split("\n")):
            s.text(x + 74, 110 + j * 18, ln, size=10.5, color=MUTED)
    s.text(360, 222, "probe each bias on your rubric:  swap A/B, shorten a winner, test the same judge on its own outputs", size=11, color=MUTED)
    s.text(360, 244, "a judge that fails a probe should not be trusted for the adjacent real task", size=11, color=MUTED)
    s.save(out)

def distillation_flow(out):
    s = SVG(720, 250, "Knowledge distillation: copy the soft distribution, not just the label")
    s.box(40, 90, 120, 50, "teacher model\n(large)", VIOLET, sub="frozen")
    s.box(430, 90, 120, 50, "student model\n(small)", EMERALD, sub="trained")
    s.box(230, 170, 180, 50, "input batch", CYAN)
    s.arrow(290, 168, 166, 144, color=CYAN, sw=1.4)
    s.arrow(290, 168, 468, 144, color=CYAN, sw=1.4)
    s.box(160, 46, 120, 40, "soft logits", VIOLET, sub="full distribution", mono=True)
    s.box(430, 46, 120, 40, "student logits", EMERALD, mono=True)
    s.arrow(100, 90, 100, 88); s.arrow(490, 90, 490, 88)
    s.arrow(282, 66, 428, 66, label="KL(T ∥ S) → loss")
    s.text(360, 220, "hard labels say 'correct class'; soft labels say 'the teacher thought cat was 63% likely,", size=11.5, color=MUTED)
    s.text(360, 238, "truck 4% — much richer signal for the student to imitate", size=11.5, color=MUTED)
    s.save(out)

def drift_leads_lags(out):
    s = SVG(720, 280, "Leading and lagging drift indicators")
    x0, y0 = s.axis(80, 60, 540, 180, xlabel="time", ylabel="")
    import math
    T = 50
    def xp(t): return x0 + t * (540 / T)
    def yp(v, sc=140): return y0 - v * sc

    s.text(x0 + 540, y0 - 164, "input distribution shift (leading)", size=10.5, color=AMBER, anchor="end")
    lead = [(xp(t), yp(0.05 + 0.6 * max(0, (t - 20) / 30))) for t in range(T + 1)]
    s.poly(lead, color=AMBER, sw=2.2)

    s.text(x0 + 540, y0 - 104, "quality score (lagging)", size=10.5, color=ROSE, anchor="end")
    lag = [(xp(t), yp(1.0 - 0.8 * max(0, (t - 28) / 22))) for t in range(T + 1)]
    s.poly(lag, color=ROSE, sw=2.2)

    s.line(xp(20), y0, xp(20), yp(0.92), color=FAINT, sw=1.2, dash="5,4")
    s.text(xp(20), yp(0.96), "distribution starts shifting", size=9.5, color=MUTED)
    s.line(xp(28), y0, xp(28), yp(0.92), color=FAINT, sw=1.2, dash="5,4")
    s.text(xp(28), yp(0.96), "quality drops 8 days later", size=9.5, color=ROSE)
    s.text(360, 268, "monitor inputs NOW so you act before quality metrics tell you it's already too late", size=11.5, color=MUTED)
    s.save(out)

def debug_winrate(out):
    s = SVG(720, 230, "The bug: counting ties as wins")
    rows = [("win", EMERALD), ("tie", AMBER), ("tie", AMBER), ("loss", ROSE), ("tie", AMBER)]
    for i, (r, col) in enumerate(rows):
        s.rect(60 + i * 80, 70, 68, 44, fill=col + "26", stroke=col, rx=8)
        s.text(94 + i * 80, 96, r, size=12, color=col, weight="600", mono=True)
    s.text(80, 150, "buggy:   (1 win + 3 ties) / 5 = 0.80   ← ties counted as wins", size=12, color=ROSE, anchor="start", mono=True)
    s.text(80, 176, "correct: 1 win + 0.5 × 3 ties = 2.5 / 5 = 0.50", size=12, color=EMERALD, anchor="start", mono=True)
    s.text(360, 214, "a tie means the judge cannot tell the models apart — half a win each is the honest accounting", size=11.5, color=MUTED)
    s.save(out)

# --- C7: Production ---

def kv_cache_prefill(out):
    s = SVG(720, 260, "Prefill vs decode: two phases, two bottlenecks")
    s.rect(56, 60, 240, 110, fill=VIOLET + "10", stroke=VIOLET, rx=10)
    s.text(176, 84, "prefill", size=13, color=VIOLET, weight="600")
    s.text(176, 104, "process all prompt tokens", size=10.5, color=MUTED)
    s.text(176, 120, "in parallel", size=10.5, color=MUTED)
    s.text(176, 140, "compute-bound", size=11, color=CYAN, mono=True)
    s.text(176, 158, "fills KV cache once", size=10.5, color=MUTED)
    s.rect(370, 60, 270, 110, fill=EMERALD + "10", stroke=EMERALD, rx=10)
    s.text(505, 84, "decode", size=13, color=EMERALD, weight="600")
    s.text(505, 104, "one new token per step", size=10.5, color=MUTED)
    s.text(505, 120, "reads entire KV cache every step", size=10.5, color=MUTED)
    s.text(505, 140, "memory-bandwidth-bound", size=11, color=AMBER, mono=True)
    s.text(505, 158, "T decode steps for T tokens", size=10.5, color=MUTED)
    s.arrow(296, 115, 366, 115)
    s.text(360, 220, "speculative decoding attacks the decode phase: draft 4–8 tokens, verify in one prefill step", size=11.5, color=MUTED)
    s.text(360, 240, "if most drafts are accepted you get ~3× throughput at identical quality", size=11.5, color=MUTED)
    s.save(out)

def latency_stack(out):
    s = SVG(720, 280, "Where the ms live: from request to first byte")
    layers = [
        ("network (ingress)", 12, FAINT),
        ("queue wait", 40, AMBER),
        ("prefill (prompt processing)", 90, VIOLET),
        ("TTFT: first token emitted →", 0, None),
        ("decode N tokens", 280, EMERALD),
        ("network (egress)", 8, FAINT),
    ]
    y = 60
    for name, ms, col in layers:
        if col is None:
            s.line(82, y, 638, y, color=ROSE, sw=1.8, dash="4,3")
            s.text(360, y - 6, name, size=10.5, color=ROSE)
            continue
        w = max(ms * 1.6, 4)
        s.rect(82, y, w, 32, fill=col + "28", stroke=col, rx=5)
        s.text(82 + w + 6, y + 20, f"{name}  {ms}ms", size=10.5, color=TEXT, anchor="start")
        y += 38
    s.text(360, 264, "TTFT = time to first token — what the user FEELS as latency; total time = TTFT + N × decode_step", size=11, color=MUTED)
    s.save(out)

def circuit_breaker(out):
    s = SVG(720, 270, "Circuit breaker: three states")
    for x, label, sub, col in ((60, "CLOSED", "normal", EMERALD), (280, "OPEN", "fail-fast", ROSE), (500, "HALF-OPEN", "probe", AMBER)):
        s.rect(x, 80, 160, 70, fill=col + "1e", stroke=col, rx=10)
        s.text(x + 80, 112, label, size=14, color=col, weight="700")
        s.text(x + 80, 136, sub, size=11, color=MUTED)
    s.arrow(220, 115, 278, 115, label="error rate > threshold")
    s.arrow(460, 115, 498, 115, label="timeout expires")
    s.arrow(580, 80, 580, 50, color=FAINT); s.line(580, 50, 140, 50, color=FAINT); s.arrow(140, 50, 140, 78, color=FAINT)
    s.text(360, 42, "probe succeeds → CLOSED", size=10.5, color=MUTED)
    s.arrow(580, 152, 580, 196, color=ROSE); s.line(580, 196, 340, 196, color=ROSE); s.arrow(340, 196, 340, 152, color=ROSE)
    s.text(360, 208, "probe fails → back to OPEN", size=10.5, color=ROSE)
    s.text(360, 254, "OPEN state returns an error immediately — no waiting for a downstream that is already broken", size=11.5, color=MUTED)
    s.save(out)

def deployment_stages(out):
    s = SVG(720, 240, "Progressive deployment: evidence gates each stage")
    stages = [("shadow", "1%", FAINT), ("canary", "5%", CYAN), ("limited", "20%", VIOLET), ("broad", "80%", EMERALD), ("full", "100%", AMBER)]
    x = 52
    for i, (nm, pct, col) in enumerate(stages):
        s.box(x, 80, 108, 52, nm, col, sub=f"{pct} traffic")
        if i < 4:
            s.arrow(x + 108, 106, x + 118, 106, label="gate ✓")
        x += 128
    s.text(360, 196, "each gate: metric stable for T hours, p99 within SLO, error rate below threshold, rollback tested", size=11.5, color=MUTED)
    s.text(360, 214, "gate failure triggers immediate rollback — NOT a manual conversation", size=11.5, color=MUTED)
    s.save(out)

def retry_backoff(out):
    s = SVG(720, 280, "Linear vs exponential backoff under an outage")
    x0, y0 = s.axis(80, 60, 540, 160, xlabel="attempt", ylabel="delay (ms)")
    pts_lin = [(x0 + i * 108, y0 - i * 20) for i in range(6)]
    pts_exp = [(x0 + i * 108, y0 - min(150, (2 ** i) * 8)) for i in range(6)]
    s.poly(pts_lin, color=ROSE, sw=2.2)
    s.text(x0 + 300, y0 - 80, "linear — herd returns together", size=11, color=ROSE)
    s.poly(pts_exp, color=EMERALD, sw=2.2)
    s.text(x0 + 260, y0 - 140, "exponential — spreads the herd", size=11, color=EMERALD)
    s.text(360, 264, "exponential: delay = base × 2^attempt + jitter; cap at a max to bound worst case", size=11.5, color=MUTED, mono=True)
    s.save(out)

def observability_triangle(out):
    s = SVG(720, 260, "Three telemetry types — different questions, same system")
    items = [
        ("traces", "What happened to\nrequest r-abc-42?", "per-request journey", VIOLET),
        ("metrics", "How many req/s failed\nin the last 5 minutes?", "aggregate statistics", CYAN),
        ("logs", "Why did this request\nchoose prompt variant B?", "discrete decisions", EMERALD),
    ]
    for i, (nm, q, body, col) in enumerate(items):
        x = 40 + i * 230
        s.rect(x, 56, 200, 130, fill=col + "12", stroke=col, rx=10)
        s.text(x + 100, 80, nm, size=14, color=col, weight="700")
        for j, ln in enumerate(q.split("\n")):
            s.text(x + 100, 106 + j * 16, ln, size=10, color=MUTED, anchor="middle")
        s.text(x + 100, 152, body, size=10.5, color=TEXT, mono=True)
    s.text(360, 236, "all three are needed: metrics alert you, traces explain one, logs preserve the decision", size=11.5, color=MUTED)
    s.save(out)

def debug_retry(out):
    s = SVG(720, 240, "The bug: linear delay labeled 'exponential backoff'")
    s.grid(80, 80, 80, 1, 5,
           values=[["100ms", "200ms", "300ms", "400ms", "500ms"]],
           colors=[[ROSE + "26"] * 5],
           labels_top=[f"attempt {i+1}" for i in range(5)])
    s.text(80, 148, "correct exponential: 100 · 2^0 = 100,  · 2^1 = 200,  · 2^2 = 400 ...", size=11.5, color=EMERALD, anchor="start", mono=True)
    s.text(80, 174, "       what we have:    100,              200,              300 ... linear", size=11.5, color=ROSE, anchor="start", mono=True)
    s.text(360, 216, "the sequence [100, 200, 300, 400, 500] STARTS like doubling but diverges at attempt 3", size=11.5, color=MUTED)
    s.save(out)

# --- C8: Capstone ---

def noninferiority(out):
    s = SVG(720, 280, "Superiority vs non-inferiority: two different claims")
    x0, y0 = s.axis(100, 60, 500, 160, xlabel="metric difference (new − old)", ylabel="")
    zero = x0 + 250; margin = x0 + 370
    s.line(zero, 60, zero, y0 + 10, color=FAINT, sw=1.2, dash="5,4")
    s.text(zero, 50, "0", size=10, color=MUTED, mono=True)
    s.line(margin, 60, margin, y0 + 10, color=ROSE, sw=1.5, dash="4,3")
    s.text(margin + 4, 50, "−δ margin", size=10, color=ROSE, mono=True)
    # non-inferior: CI is entirely right of −δ
    s.line(zero + 30, y0 - 50, zero + 140, y0 - 50, color=EMERALD, sw=3.5)
    s.circle(zero + 86, y0 - 50, 5, fill=EMERALD)
    s.text(x0 + 500 + 10, y0 - 46, "non-inferior ✓", size=11, color=EMERALD, anchor="start")
    # fails: CI crosses −δ
    s.line(zero - 120, y0 - 90, zero + 60, y0 - 90, color=ROSE, sw=3.5)
    s.circle(zero - 30, y0 - 90, 5, fill=ROSE)
    s.text(x0 + 500 + 10, y0 - 86, "fails: CI crosses margin", size=11, color=ROSE, anchor="start")
    # superior
    s.line(zero + 10, y0 - 130, zero + 120, y0 - 130, color=VIOLET, sw=3.5)
    s.circle(zero + 66, y0 - 130, 5, fill=VIOLET)
    s.text(x0 + 500 + 10, y0 - 126, "superior (CI right of 0)", size=11, color=VIOLET, anchor="start")
    s.text(360, 264, "non-inferiority claims 'not meaningfully worse' — the CI must clear the margin, not just zero", size=11.5, color=MUTED)
    s.save(out)

def artifact_manifest(out):
    s = SVG(720, 260, "Artifact manifest: one file ties model to everything it needs")
    s.rect(120, 50, 480, 160, fill=BG, stroke=BORDER, rx=10)
    fields = [
        ("model_weights",   "gs://models/gpt2-xl-v3/model.safetensors", CYAN),
        ("tokenizer",       "tiktoken bpe, sha256: a1b2c3...",           CYAN),
        ("index",           "faiss-flat v2026-08-12, sha256: d4e5f6...", VIOLET),
        ("prompt_template", "templates/v7_retail.jinja2 → git abc1234",  VIOLET),
        ("eval_dataset",    "gs://evals/retail-v4/golden.jsonl",         EMERALD),
        ("metric_results",  "ndcg=0.73, p@10=0.68, winrate=0.62",        EMERALD),
    ]
    for i, (k, v, col) in enumerate(fields):
        y = 70 + i * 24
        s.text(138, y, f"{k}:", size=10.5, color=col, anchor="start", mono=True)
        s.text(300, y, v, size=10, color=MUTED, anchor="start", mono=True)
    s.text(360, 234, "the manifest digest locks model + data + prompts + results into a single reproducible reference", size=11.5, color=MUTED)
    s.save(out)

def debug_gate(out):
    s = SVG(720, 240, "The bug: checking the upper CI bound instead of the lower")
    x0, y0 = s.axis(100, 56, 500, 130, xlabel="quality difference (new − old)", ylabel="")
    zero = x0 + 260; margin = x0 + 380
    s.line(zero, 56, zero, y0 + 8, color=FAINT, sw=1.2, dash="5,4")
    s.text(zero, 48, "0", size=10, color=MUTED, mono=True)
    s.line(margin, 56, margin, y0 + 8, color=ROSE, sw=1.4, dash="4,3")
    s.text(margin + 4, 48, "−δ margin", size=10, color=ROSE, mono=True)
    s.line(zero - 110, y0 - 60, zero + 120, y0 - 60, color=AMBER, sw=3)
    s.circle(zero + 6, y0 - 60, 4, fill=AMBER)
    lo = zero - 110; hi = zero + 120
    s.circle(lo, y0 - 60, 5, fill=ROSE)
    s.circle(hi, y0 - 60, 5, fill=EMERALD)
    s.text(lo - 4, y0 - 72, "lower CI", size=10, color=ROSE, anchor="end")
    s.text(hi + 4, y0 - 72, "upper CI", size=10, color=EMERALD, anchor="start")
    s.text(100, y0 - 10, "lower CI < margin → GATE SHOULD BLOCK", size=11.5, color=ROSE, anchor="start")
    s.text(100, y0 + 6, "but bug checks upper CI > margin → passes anything (True if mean > 0)", size=11.5, color=MUTED, anchor="start")
    s.text(360, y0 + 40, "'confident it is no worse' = LOWER end of the interval clears the bar — the pessimistic case", size=11.5, color=MUTED)
    s.save(out)

DIAGRAMS = [
    ("c6/rubric_agreement.svg", rubric_agreement),
    ("c6/uncertainty_bars.svg", uncertainty_bars),
    ("c6/calibration_diagram.svg", calibration_diagram),
    ("c6/llm_judge_biases.svg", llm_judge_biases),
    ("c6/distillation_flow.svg", distillation_flow),
    ("c6/drift_leads_lags.svg", drift_leads_lags),
    ("c6/debug_winrate.svg", debug_winrate),
    ("c7/kv_cache_prefill.svg", kv_cache_prefill),
    ("c7/latency_stack.svg", latency_stack),
    ("c7/circuit_breaker.svg", circuit_breaker),
    ("c7/deployment_stages.svg", deployment_stages),
    ("c7/retry_backoff.svg", retry_backoff),
    ("c7/observability_triangle.svg", observability_triangle),
    ("c7/debug_retry.svg", debug_retry),
    ("c8/noninferiority.svg", noninferiority),
    ("c8/artifact_manifest.svg", artifact_manifest),
    ("c8/debug_gate.svg", debug_gate),
]
