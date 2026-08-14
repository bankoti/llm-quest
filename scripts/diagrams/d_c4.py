"""Course 4 + 5 diagrams: AI system design, retrieval."""
from svgkit import *
import math

def baseline_control(out):
    s = SVG(720, 240, "Build the control before the treatment")
    s.box(40, 90, 100, 44, "traffic", CYAN)
    s.arrow(140, 112, 178, 112)
    s.box(180, 60, 170, 44, "baseline heuristic", EMERALD, sub="rules / lookup / regex")
    s.box(180, 130, 170, 44, "AI treatment", VIOLET, sub="candidate")
    s.arrow(146, 112, 178, 82, color=FAINT); s.arrow(146, 112, 178, 152, color=FAINT)
    s.arrow(350, 82, 420, 100, color=FAINT); s.arrow(350, 152, 420, 128, color=FAINT)
    s.box(422, 92, 150, 44, "same metrics", AMBER, sub="frozen eval set")
    s.arrow(572, 114, 610, 114)
    s.box(612, 92, 80, 44, "verdict", ROSE, sub="is AI needed?")
    s.text(360, 208, "if the baseline hits the target, ship the baseline — the AI must beat a real control,", size=11.5, color=MUTED)
    s.text(360, 226, "measured by instrumentation that exists BEFORE any model is trained", size=11.5, color=MUTED)
    s.save(out)

def latency_budget(out):
    s = SVG(720, 250, "An 800 ms budget, spent explicitly")
    parts = [("gateway", 40, FAINT), ("retrieval", 120, CYAN), ("rerank", 90, BLUE),
             ("generation", 450, VIOLET), ("post + reserve", 100, AMBER)]
    x = 60; total = 800; scale = 600 / total
    for name, ms, col in parts:
        w = ms * scale
        s.rect(x, 90, w, 44, fill=col + "33", stroke=col, rx=4)
        if w > 60:
            s.text(x + w / 2, 112, name, size = 10.5, color=TEXT)
            s.text(x + w / 2, 126, f"{ms}ms", size=9.5, color=MUTED, mono=True)
        else:
            s.text(x + w / 2, 82, f"{name} {ms}", size=9, color=MUTED)
        x += w
    s.line(60, 150, 660, 150, color=FAINT)
    s.text(60, 168, "0", size=10, color=MUTED, mono=True)
    s.text(660, 168, "800 ms p99 promise", size=10, color=MUTED, anchor="end", mono=True)
    s.text(360, 200, "budget the p99, not the mean — and leave reserve: a budget with no slack", size=11.5, color=MUTED)
    s.text(360, 218, "is a promise you break on the first bad day", size=11.5, color=MUTED)
    s.save(out)

def placement_spectrum(out):
    s = SVG(720, 260, "Five placements: how close does the model sit to the request?")
    s.arrow(60, 200, 670, 200, color=FAINT, sw=1.5)
    s.text(80, 224, "far from request path (safe, stale)", size=10.5, color=MUTED, anchor="start")
    s.text(650, 224, "in the request path (fresh, risky)", size=10.5, color=MUTED, anchor="end")
    boxes = [("offline intelligence", "model writes rules/tables,\nruntime is classical", EMERALD, 60),
             ("teacher → student", "small distilled model\nserves online", CYAN, 185),
             ("shared embeddings", "precomputed vectors,\nonline similarity only", BLUE, 310),
             ("head cache + tail", "cached answers first,\nmodel on misses w/ deadline", AMBER, 435),
             ("direct generation", "LLM call per request,\nfull latency + cost exposure", ROSE, 560)]
    for i, (t, body, col, x) in enumerate(boxes):
        y = 56 if i % 2 == 0 else 108
        s.rect(x, y, 122, 46, fill=col + "1e", stroke=col, rx=8)
        s.text(x + 61, y + 18, t, size=10, color=TEXT, weight="600")
        for j, ln in enumerate(body.split("\n")):
            s.text(x + 61, y + 32 + j * 11, ln, size=8, color=MUTED)
        s.line(x + 61, y + 46, x + 61, 196, color=col, sw=1, dash="3,3")
        s.circle(x + 61, 200, 4, fill=col)
    s.save(out)

def break_even(out):
    s = SVG(720, 280, "Break-even: fixed cost vs per-request savings")
    x0, y0 = s.axis(80, 60, 540, 160, xlabel="requests / month", ylabel="monthly cost")
    def pt(rx, ry): return (x0 + rx * 540, y0 - ry * 150)
    s.poly([pt(0, 0.05), pt(1, 0.92)], color=ROSE, sw=2.2)
    s.text(*pt(0.86, 0.98), "buy: teacher API", size=11, color=ROSE, mono=False)
    s.poly([pt(0, 0.45), pt(1, 0.68)], color=EMERALD, sw=2.2)
    s.text(*pt(0.83, 0.58), "build: student + fixed", size=11, color=EMERALD)
    bx, by = pt(0.52, 0.5)
    s.circle(bx, by, 5, fill=AMBER)
    s.line(bx, by, bx, y0, color=AMBER, sw=1.2, dash="4,4")
    s.text(bx, y0 + 16, "N* = F / (c_teacher − c_student)", size=11, color=AMBER, mono=True)
    s.text(360, 264, "below N* the fixed cost never pays back; above it, every request is savings", size=11.5, color=MUTED)
    s.save(out)

def build_buy(out):
    s = SVG(720, 240, "Gates first, scorecard second")
    s.box(40, 80, 120, 50, "candidates", CYAN, sub="build / buy / adapt")
    s.arrow(160, 105, 198, 105)
    s.rect(200, 60, 150, 92, fill=ROSE + "12", stroke=ROSE, rx=8)
    s.text(275, 82, "hard gates", size=12, color=ROSE, weight="600")
    for i, g in enumerate(["data residency", "latency ceiling", "cost ceiling"]):
        s.text(275, 102 + i * 16, g, size=10, color=MUTED, mono=True)
    s.arrow(350, 105, 388, 105, label="survivors")
    s.box(390, 80, 140, 50, "weighted scorecard", AMBER, sub="quality·ops·risk·cost")
    s.arrow(530, 105, 568, 105)
    s.box(570, 80, 110, 50, "decision", EMERALD, sub="+ exit criteria")
    s.text(360, 190, "a gate failure eliminates immediately — no scorecard points can buy it back;", size=11.5, color=MUTED)
    s.text(360, 208, "score only the options that survived every gate", size=11.5, color=MUTED)
    s.save(out)

def risk_matrix(out):
    s = SVG(720, 300, "Prioritize threats by likelihood × impact")
    cell = 60
    x0, y0 = 160, 70
    shades = [[EMERALD, AMBER, ROSE], [EMERALD, AMBER, ROSE], [EMERALD, EMERALD, AMBER]]
    grades = [["med", "high", "CRIT"], ["low", "med", "high"], ["low", "low", "med"]]
    cols = [[(ROSE if g in ("CRIT", "high") else AMBER if g == "med" else EMERALD) + "26" for g in row] for row in grades]
    s.grid(x0, y0, cell, 3, 3, values=grades, colors=cols,
           labels_top=["minor", "degraded", "breach"],
           labels_left=["likely", "possible", "rare"])
    s.text(x0 + 1.5 * cell, y0 + 3 * cell + 30, "impact →", size=11, color=MUTED)
    s.text(x0 - 96, y0 + 1.5 * cell, "likelihood ↑", size=11, color=MUTED)
    s.text(430, 100, "place SPECIFIC scenarios, not labels:", size=11.5, color=TEXT, anchor="start", weight="600")
    for i, t in enumerate(['"prompt injection exfiltrates order data"',
                            '"index rebuild serves stale prices"',
                            '"retry storm doubles token spend"']):
        s.text(430, 124 + i * 20, t, size=10.5, color=MUTED, anchor="start", mono=True)
    s.text(430, 196, "top-right cell = mitigation is mandatory", size=11, color=ROSE, anchor="start")
    s.text(430, 216, "and must be VERIFIED by a test, not asserted", size=11, color=MUTED, anchor="start")
    s.save(out)

def debug_precision(out):
    s = SVG(720, 250, "precision@10 — what is the denominator?")
    for i in range(10):
        filled = i < 5
        rel = i in (0, 2, 4)
        col = EMERALD if rel else (FAINT if filled else BORDER)
        fill = EMERALD + "30" if rel else (FAINT + "22" if filled else BG)
        s.rect(60 + i * 56, 80, 48, 48, fill=fill, stroke=col, rx=8)
        s.text(84 + i * 56, 108, "rel" if rel else ("doc" if filled else "—"), size=11, color=TEXT if filled else FAINT, mono=True)
    s.text(60, 66, "retriever returned 5 docs against a budget of k = 10 · 3 relevant", size=11, color=MUTED, anchor="start")
    s.text(80, 172, "3 / 5  = 0.60   ← rewards returning less", size=12, color=ROSE, anchor="start", mono=True)
    s.text(80, 198, "3 / 10 = 0.30   ← charges the full budget k", size=12, color=EMERALD, anchor="start", mono=True)
    s.text(360, 232, "the metric's job is to make the empty slots hurt", size=11.5, color=MUTED)
    s.save(out)

# ---------------- Course 5 ----------------

def bm25_saturation(out):
    s = SVG(720, 270, "BM25: repeated terms saturate")
    x0, y0 = s.axis(80, 60, 540, 160, xlabel="term frequency in document", ylabel="score contribution")
    lin = [(x0 + t * 27, y0 - t * 8) for t in range(21)]
    s.poly(lin, color=ROSE, sw=2, dash="5,4")
    s.text(x0 + 420, y0 - 158, "raw tf (linear — spammable)", size=11, color=ROSE)
    k1 = 1.4
    sat = [(x0 + t * 27, y0 - (t * (k1 + 1) / (t + k1)) * 55) for t in range(21)]
    s.poly(sat, color=EMERALD, sw=2.4)
    s.text(x0 + 430, y0 - 100, "BM25: tf·(k1+1)/(tf+k1)", size=11, color=EMERALD, mono=True)
    s.text(360, 256, "the 30th repetition of a term is worth almost nothing — plus length normalization", size=11.5, color=MUTED)
    s.save(out)

def ann_space(out):
    s = SVG(720, 280, "Dense retrieval: nearest neighbors in embedding space")
    import random
    random.seed(3)
    pts = [(random.uniform(70, 620), random.uniform(70, 230)) for _ in range(46)]
    for x, y in pts:
        s.circle(x, y, 3.2, fill=FAINT, opacity=0.8)
    qx, qy = 300, 150
    near = sorted(pts, key=lambda p: (p[0] - qx) ** 2 + (p[1] - qy) ** 2)[:5]
    for x, y in near[:4]:
        s.circle(x, y, 4.4, fill=EMERALD)
        s.line(qx, qy, x, y, color=EMERALD, sw=1, dash="3,3")
    mx, my = near[4]
    s.circle(mx, my, 4.4, fill=AMBER)
    s.circle(qx, qy, 6, fill=CYAN)
    s.text(qx, qy - 14, "query", size=11, color=CYAN, weight="600")
    s.legend(80, 262, [(EMERALD, "found by ANN"), (AMBER, "true neighbor missed (recall < 1)"), (CYAN, "query")])
    s.text(520, 250, "ANN trades a little recall", size=11, color=MUTED, anchor="start")
    s.text(520, 266, "for 100–1000× less work", size=11, color=MUTED, anchor="start")
    s.save(out)

def hybrid_fusion(out):
    s = SVG(720, 260, "Hybrid retrieval: two signals, fused")
    s.box(60, 60, 130, 46, "BM25", CYAN, sub="exact terms, IDs")
    s.box(60, 140, 130, 46, "dense encoder", VIOLET, sub="paraphrase, intent")
    s.arrow(190, 83, 280, 83, label="ranked list A")
    s.arrow(190, 163, 280, 163, label="ranked list B")
    s.box(282, 100, 150, 50, "fusion (RRF)", AMBER, sub="rank-based, no tuning")
    s.arrow(432, 125, 490, 125)
    s.box(492, 100, 130, 50, "fused top-k", EMERALD, sub="→ reranker")
    s.text(360, 224, 'lexical wins on "error E4521 manual"; dense wins on "my machine is leaking";', size=11.5, color=MUTED)
    s.text(360, 242, "production systems rarely bet on only one", size=11.5, color=MUTED)
    s.save(out)

def query_constraints(out):
    s = SVG(720, 260, "Split the query: hard constraints filter, soft text ranks")
    s.box(40, 96, 190, 48, '"red running shoes\nunder $100, size 42"', CYAN)
    s.arrow(230, 120, 268, 120)
    s.box(270, 96, 120, 48, "interpreter", VIOLET, sub="parse, don't embed")
    s.arrow(390, 108, 440, 78, color=FAINT)
    s.arrow(390, 132, 440, 168, color=FAINT)
    s.box(442, 56, 200, 44, "filters: price<100, size=42", ROSE, sub="HARD — never violated", mono=True)
    s.box(442, 146, 200, 44, 'text: "red running shoes"', EMERALD, sub="SOFT — similarity ranks", mono=True)
    s.text(360, 232, "embedding 'under $100' does not enforce it — a $180 shoe can be semantically 'close';", size=11.5, color=MUTED)
    s.text(360, 250, "constraints belong in the WHERE clause, not the vector", size=11.5, color=MUTED)
    s.save(out)

def rerank_funnel(out):
    s = SVG(720, 260, "Two stages: cheap recall, expensive precision")
    stages = [("corpus", "10,000,000 docs", FAINT, 300),
              ("retriever (bi-encoder / BM25)", "top 200 — fast, independent embeddings", CYAN, 210),
              ("reranker (cross-encoder)", "top 10 — reads query+doc together", VIOLET, 110),
              ("answer context", "3–5 passages", EMERALD, 54)]
    y = 54
    for t, sub, col, w in stages:
        x = 360 - w
        s.rect(x, y, w * 2, 38, fill=col + "1e", stroke=col, rx=8)
        s.text(360, y + 17, t, size=11.5, color=TEXT, weight="600")
        s.text(360, y + 31, sub, size=9.5, color=MUTED, mono=True)
        y += 50
    s.text(360, 246, "the reranker is too slow for the corpus and the retriever too coarse for the answer —", size=11, color=MUTED)
    s.text(360, 260, "", size=1)
    s.save(out)

def grounded_citations(out):
    s = SVG(720, 270, "Claim-level grounding: every sentence points at its evidence")
    for i, (nm, col) in enumerate((("[1] returns policy", CYAN), ("[2] shipping FAQ", CYAN), ("[3] refund terms", CYAN))):
        s.box(40, 56 + i * 62, 160, 44, nm, col, mono=True)
    s.rect(320, 56, 360, 168, fill=BG, stroke=BORDER, rx=10)
    s.text(340, 80, "answer", size=11, color=MUTED, anchor="start")
    claims = [("Returns are free within 30 days. [1]", EMERALD, 0),
              ("Refunds post in 5–7 business days. [3]", EMERALD, 2),
              ("Exchanges ship overnight.  ⚠ no source", ROSE, None)]
    for j, (txt, col, src) in enumerate(claims):
        y = 104 + j * 34
        s.text(340, y, txt, size=11, color=col, anchor="start", mono=True)
        if src is not None:
            s.arrow(316, y - 4, 202, 78 + src * 62, color=FAINT, sw=1, dash="3,3")
    s.text(360, 252, "grounding is checked per CLAIM, not per answer — the third sentence must be dropped or flagged", size=11, color=MUTED)
    s.save(out)

def debug_topk(out):
    s = SVG(720, 240, "The bug: argsort sorts ascending")
    scores = [0.10, 0.90, 0.50, 0.30, 0.70]
    s.grid(120, 70, 56, 1, 5, values=[[f"{v:.1f}" for v in scores]], labels_top=[f"d{i}" for i in range(5)])
    s.text(80, 100, "scores", size=11, color=MUTED, anchor="end", mono=True)
    s.text(120, 158, "argsort(s)[:2]        → [0, 3] — the WORST two", size=12, color=ROSE, anchor="start", mono=True)
    s.text(120, 184, "argsort(s)[::-1][:2]  → [1, 4] — the best two", size=12, color=EMERALD, anchor="start", mono=True)
    s.text(360, 222, "'consistently terrible' is the argsort-direction signature — flawless code, backwards order", size=11.5, color=MUTED)
    s.save(out)

DIAGRAMS = [
    ("c4/baseline_control.svg", baseline_control),
    ("c4/latency_budget.svg", latency_budget),
    ("c4/placement_spectrum.svg", placement_spectrum),
    ("c4/break_even.svg", break_even),
    ("c4/build_buy.svg", build_buy),
    ("c4/risk_matrix.svg", risk_matrix),
    ("c4/debug_precision.svg", debug_precision),
    ("c5/bm25_saturation.svg", bm25_saturation),
    ("c5/ann_space.svg", ann_space),
    ("c5/hybrid_fusion.svg", hybrid_fusion),
    ("c5/query_constraints.svg", query_constraints),
    ("c5/rerank_funnel.svg", rerank_funnel),
    ("c5/grounded_citations.svg", grounded_citations),
    ("c5/debug_topk.svg", debug_topk),
]
