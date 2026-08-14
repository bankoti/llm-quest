"""Course 2 + 3 diagrams: modern architecture, architecture zoo."""
from svgkit import *

def rmsnorm_vs_layernorm(out):
    s = SVG(720, 240, "LayerNorm vs RMSNorm: one step fewer")
    s.text(70, 76, "LayerNorm", size=13, color=BLUE, anchor="start", weight="600")
    s.box(70, 90, 56, 38, "x", CYAN, mono=True)
    s.arrow(126, 109, 158, 109)
    s.box(160, 90, 108, 38, "x − mean(x)", BLUE, sub="center", mono=True)
    s.arrow(268, 109, 300, 109)
    s.box(302, 90, 96, 38, "÷ std(x)", BLUE, mono=True)
    s.arrow(398, 109, 430, 109)
    s.box(432, 90, 96, 38, "× γ  (+ β)", BLUE, sub="learned", mono=True)
    s.text(70, 168, "RMSNorm", size=13, color=EMERALD, anchor="start", weight="600")
    s.box(70, 182, 56, 38, "x", CYAN, mono=True)
    s.arrow(126, 201, 158, 201)
    s.box(160, 182, 238, 38, "÷ rms(x) = √(mean(x²)+ε)", EMERALD, mono=True)
    s.arrow(398, 201, 430, 201)
    s.box(432, 182, 96, 38, "× γ", EMERALD, sub="learned", mono=True)
    s.text(560, 108, "no centering,", size=11.5, color=MUTED, anchor="start")
    s.text(560, 126, "no bias β —", size=11.5, color=MUTED, anchor="start")
    s.text(560, 200, "same stability,", size=11.5, color=MUTED, anchor="start")
    s.text(560, 218, "cheaper compute", size=11.5, color=MUTED, anchor="start")
    s.save(out)

def gqa_heads(out):
    s = SVG(720, 300, "MHA → GQA → MQA: how many KV heads back the query heads?")
    def panel(x, title, nq, nkv, color):
        s.text(x + 100, 66, title, size=12.5, color=color, weight="600")
        qw = 200 / nq
        for i in range(nq):
            s.rect(x + i * qw + 2, 84, qw - 4, 30, fill=CYAN + "22", stroke=CYAN, rx=4)
        s.text(x + 100, 78, "", size=10)
        kw = 200 / nkv
        for j in range(nkv):
            s.rect(x + j * kw + 2, 180, kw - 4, 30, fill=color + "26", stroke=color, rx=4)
        for i in range(nq):
            j = i * nkv // nq
            s.line(x + i * qw + qw / 2, 116, x + j * kw + kw / 2, 178, color=FAINT, sw=1)
        s.text(x + 100, 132, f"{nq} query heads", size=10.5, color=MUTED)
        s.text(x + 100, 230, f"{nkv} KV head{'s' if nkv > 1 else ''}", size=10.5, color=MUTED)
    panel(30, "MHA", 8, 8, VIOLET)
    panel(262, "GQA", 8, 2, EMERALD)
    panel(494, "MQA", 8, 1, AMBER)
    s.text(360, 262, "KV cache scales with KV heads only:  MHA 8× · GQA 2× · MQA 1×", size=12, color=TEXT, mono=True)
    s.text(360, 284, "queries keep full capacity; keys/values are shared within each group", size=11.5, color=MUTED)
    s.save(out)

def moe_router(out):
    s = SVG(720, 280, "Sparse MoE: each token activates only top-k experts")
    s.box(40, 110, 90, 44, "token", CYAN, sub="hidden state")
    s.arrow(130, 132, 178, 132)
    s.box(180, 110, 92, 44, "router", VIOLET, sub="softmax gate")
    experts = [("E0", 0.62, True), ("E1", 0.0, False), ("E2", 0.31, True), ("E3", 0.0, False)]
    for i, (nm, wt, hot) in enumerate(experts):
        y = 40 + i * 56
        col = EMERALD if hot else FAINT
        s.box(360, y, 100, 40, nm, col, sub=(f"gate {wt}" if hot else "skipped"), mono=True)
        if hot:
            s.arrow(272, 132, 356, y + 20, color=EMERALD, sw=1.6)
        else:
            s.line(272, 132, 356, y + 20, color=FAINT, sw=1, dash="3,4")
    s.arrow(460, 60, 540, 120, color=EMERALD); s.arrow(460, 172, 540, 140, color=EMERALD)
    s.box(542, 108, 130, 44, "Σ gateᵢ · Eᵢ(x)", AMBER, sub="weighted combine", mono=True)
    s.text(360, 262, "capacity of all experts, compute of k — but every expert must fit in memory", size=11.5, color=MUTED)
    s.save(out)

def modern_block(out):
    s = SVG(720, 250, "The modern decoder block (Llama-style)")
    y = 105
    s.box(30, y, 60, 44, "x", CYAN, mono=True)
    s.arrow(90, y + 22, 118, y + 22)
    s.box(120, y, 100, 44, "RMSNorm", VIOLET, mono=True)
    s.arrow(220, y + 22, 248, y + 22)
    s.box(250, y, 120, 44, "GQA + RoPE", VIOLET, sub="attention", mono=True)
    s.arrow(370, y + 22, 398, y + 22, label="⊕")
    s.box(400, y, 100, 44, "RMSNorm", EMERALD, mono=True)
    s.arrow(500, y + 22, 528, y + 22)
    s.box(530, y, 100, 44, "SwiGLU", EMERALD, sub="gated MLP", mono=True)
    s.arrow(630, y + 22, 668, y + 22, label="⊕")
    # residual skips
    s.line(60, y - 2, 60, 60, color=CYAN, sw=1.4); s.line(60, 60, 384, 60, color=CYAN, sw=1.4)
    s.arrow(384, 60, 384, y - 4, color=CYAN, sw=1.4)
    s.line(384, 60, 654, 60, color=CYAN, sw=1.4, opacity=0.7)
    s.arrow(654, 60, 654, y - 4, color=CYAN, sw=1.4)
    s.text(360, 50, "residual connections (pre-norm: norm sits inside the branch)", size=11, color=CYAN)
    s.text(360, 200, "swaps vs GPT-2: LayerNorm→RMSNorm · learned pos→RoPE · MHA→GQA · GELU MLP→SwiGLU", size=11.5, color=MUTED, mono=False)
    s.text(360, 222, "same residual-stream skeleton — details buy stability and serving efficiency", size=11.5, color=MUTED)
    s.save(out)

def io_aware(out):
    s = SVG(720, 270, "IO-aware attention: recompute beats re-reading HBM")
    s.rect(50, 60, 260, 150, fill=BLUE + "10", stroke=BLUE, rx=10)
    s.text(180, 84, "HBM — large, slow", size=12.5, color=BLUE, weight="600")
    s.text(180, 104, "~TB/s, tens of GB", size=10.5, color=MUTED, mono=True)
    s.grid(92, 120, 30, 2, 6)
    s.text(180, 200, "Q, K, V and the (T,T) matrix live here naively", size=10.5, color=MUTED)
    s.rect(420, 84, 190, 100, fill=EMERALD + "12", stroke=EMERALD, rx=10)
    s.text(515, 108, "SRAM — tiny, fast", size=12.5, color=EMERALD, weight="600")
    s.text(515, 126, "~19 TB/s, ~20 MB", size=10.5, color=MUTED, mono=True)
    s.grid(486, 138, 30, 1, 2, colors=[[AMBER + "40", AMBER + "40"]])
    s.arrow(312, 120, 416, 120, color=AMBER, label="stream tiles")
    s.arrow(416, 160, 312, 160, color=FAINT, label="write output once", dash="4,4")
    s.text(360, 240, "FlashAttention never materializes the (T,T) score matrix in HBM:", size=11.5, color=MUTED)
    s.text(360, 258, "it processes K/V in tiles with an online softmax — exact result, far less memory traffic", size=11.5, color=MUTED)
    s.save(out)

def kv_cache_growth(out):
    s = SVG(720, 270, "KV cache: pay for each token once")
    for step, x in ((1, 60), (2, 260), (3, 460)):
        s.text(x + 70, 66, f"decode step {step}", size=11.5, color=MUTED)
        for i in range(step + 2):
            new = i == step + 1
            col = AMBER if new else VIOLET
            s.rect(x + i * 34, 80, 30, 30, fill=col + ("40" if new else "22"), stroke=col, rx=4)
            s.text(x + i * 34 + 15, 99, f"k{i}", size=10, color=TEXT, mono=True)
        for i in range(step + 2):
            new = i == step + 1
            col = AMBER if new else VIOLET
            s.rect(x + i * 34, 116, 30, 30, fill=col + ("40" if new else "22"), stroke=col, rx=4)
            s.text(x + i * 34 + 15, 135, f"v{i}", size=10, color=TEXT, mono=True)
    s.legend(60, 180, [(VIOLET, "cached from earlier steps"), (AMBER, "computed this step (one token)")])
    s.text(360, 216, "attention for the new token: its q against ALL cached K/V — no recompute of the past", size=11.5, color=MUTED)
    s.text(360, 238, "cost: cache grows linearly — bytes = 2 · layers · T · kv_heads · head_dim · dtype", size=11.5, color=CYAN, mono=True)
    s.save(out)

def debug_rmsnorm(out):
    s = SVG(720, 210, "The bug: RMSNorm that secretly centers")
    s.text(70, 70, "buggy 'RMSNorm'", size=12.5, color=ROSE, anchor="start", weight="600")
    s.box(70, 84, 220, 40, "(x − mean(x)) ÷ rms", ROSE, mono=True)
    s.text(70, 152, "actual RMSNorm", size=12.5, color=EMERALD, anchor="start", weight="600")
    s.box(70, 166, 220, 40, "x ÷ rms(x)", EMERALD, mono=True)
    s.text(340, 104, "← this IS LayerNorm-without-bias", size=11.5, color=ROSE, anchor="start")
    s.text(340, 124, "passes eyeball tests: outputs look 'normalized'", size=11, color=MUTED, anchor="start")
    s.text(340, 186, "← the mean is deliberately kept", size=11.5, color=EMERALD, anchor="start")
    s.save(out)

# ---------------- Course 3 ----------------

def bert_vs_gpt_mask(out):
    s = SVG(720, 280, "Encoder vs decoder: who can see whom")
    n = 5; cell = 30
    full = [[EMERALD + "30"] * n for _ in range(n)]
    causal = [[EMERALD + "30" if c <= r else ROSE + "22" for c in range(n)] for r in range(n)]
    s.text(160, 66, "encoder (BERT) — bidirectional", size=12, color=EMERALD)
    s.grid(90, 80, cell, n, n, colors=full)
    s.text(160, 258, "every token sees every token", size=10.5, color=MUTED)
    s.text(520, 66, "decoder (GPT) — causal", size=12, color=VIOLET)
    s.grid(450, 80, cell, n, n, colors=causal)
    s.text(520, 258, "token t sees positions ≤ t", size=10.5, color=MUTED)
    s.text(360, 130, "→ great at understanding,", size=11, color=MUTED)
    s.text(360, 148, "cannot generate", size=11, color=MUTED)
    s.text(360, 178, "→ generates left-to-right,", size=11, color=MUTED)
    s.text(360, 196, "one cached pass per token", size=11, color=MUTED)
    s.save(out)

def local_global_masks(out):
    s = SVG(720, 300, "Attention patterns: full, sliding window, window + global")
    n = 7; cell = 24
    def pat(x, title, fn, color):
        cols = [[(color + "30" if fn(r, c) else BG) for c in range(n)] for r in range(n)]
        s.text(x + n * cell / 2, 70, title, size=11.5, color=color)
        s.grid(x, 84, cell, n, n, colors=cols)
    pat(50, "full causal — O(T²)", lambda r, c: c <= r, VIOLET)
    pat(280, "sliding window w=3", lambda r, c: c <= r and r - c < 3, CYAN)
    pat(510, "window + global token", lambda r, c: (c <= r and r - c < 3) or c == 0 or r == 0, AMBER)
    s.text(360, 282, "windows cap cost and cache; global tokens restore a path for long-range information", size=11.5, color=MUTED)
    s.save(out)

def moe_systems_cost(out):
    s = SVG(720, 270, "The systems bill for sparse MoE: routing crosses devices")
    for d in range(4):
        x = 60 + d * 160
        s.rect(x, 60, 130, 150, fill=BG, stroke=BORDER, rx=10)
        s.text(x + 65, 82, f"device {d}", size=11, color=MUTED, mono=True)
        s.box(x + 15, 96, 100, 34, f"experts {2*d},{2*d+1}", VIOLET, mono=True)
        s.box(x + 15, 160, 100, 34, "tokens", CYAN, mono=True)
    import random
    random.seed(7)
    for d in range(4):
        x1 = 60 + d * 160 + 65
        for t in range(2):
            d2 = random.choice([e for e in range(4) if e != d])
            x2 = 60 + d2 * 160 + 65
            s.arrow(x1, 158, x2, 134, color=AMBER, sw=1.2)
    s.text(360, 236, "top-k routing sends most tokens to experts on OTHER devices: all-to-all traffic", size=11.5, color=AMBER)
    s.text(360, 256, "plus every expert's weights held in memory, hot or not — FLOPs saved ≠ cost saved", size=11.5, color=MUTED)
    s.save(out)

def ssm_vs_attention(out):
    s = SVG(720, 280, "Growing memory vs fixed state")
    s.text(180, 64, "attention — addressable past", size=12.5, color=VIOLET, weight="600")
    for i in range(6):
        s.rect(60 + i * 44, 150, 36, 32, fill=VIOLET + "22", stroke=VIOLET, rx=5)
        s.text(78 + i * 44, 170, f"t{i}", size=10.5, color=TEXT, mono=True)
    for i in range(5):
        s.arrow(78 + i * 44, 148, 274, 108, color=FAINT, sw=1)
    s.circle(280, 100, 6, fill=CYAN)
    s.text(180, 216, "KV cache grows O(T); any token can be re-read exactly", size=10.5, color=MUTED)
    s.text(540, 64, "SSM — compressed state", size=12.5, color=EMERALD, weight="600")
    for i in range(4):
        x = 430 + i * 66
        s.box(x, 134, 52, 36, f"h{i}", EMERALD, mono=True)
        if i < 3:
            s.arrow(x + 52, 152, x + 64, 152, color=EMERALD, sw=1.4)
    s.text(540, 196, "state size is CONSTANT: each step folds the token in", size=10.5, color=MUTED)
    s.text(540, 214, "and irreversibly compresses the past", size=10.5, color=MUTED)
    s.text(360, 254, "the tradeoff is addressability: attention can point at any earlier token, an SSM cannot", size=11.5, color=MUTED)
    s.save(out)

def config_forensics(out):
    s = SVG(720, 220, "Four passes from mystery checkpoint to defensible claim")
    steps = [("Pass 1", "dimensions", "d_model, heads,\nlayers, vocab", CYAN),
             ("Pass 2", "construction", "trace module\ntree & wiring", VIOLET),
             ("Pass 3", "weights", "shapes reconcile\nwith config?", AMBER),
             ("Pass 4", "behavior", "probe: mask?\nrope? tied embed?", EMERALD)]
    for i, (t, sub, body, col) in enumerate(steps):
        x = 40 + i * 160
        s.box(x, 70, 130, 52, t, col, sub=sub)
        lines = body.split("\n")
        for j, ln in enumerate(lines):
            s.text(x + 65, 146 + j * 15, ln, size=10, color=MUTED, mono=True)
        if i < 3:
            s.arrow(x + 130, 96, x + 158, 96)
    s.text(360, 200, "each pass writes evidence to the log; a claim without a probe is a guess", size=11.5, color=MUTED)
    s.save(out)

def decision_defense(out):
    s = SVG(720, 230, "The decision package: constraints in, defensible choice out")
    s.box(40, 60, 120, 46, "candidates", CYAN, sub="3+ architectures")
    s.arrow(160, 83, 198, 83)
    s.box(200, 60, 130, 46, "hard constraints", ROSE, sub="latency, memory, cost")
    s.arrow(330, 83, 368, 83, label="eliminate")
    s.box(370, 60, 120, 46, "scorecard", AMBER, sub="weighted criteria")
    s.arrow(490, 83, 528, 83)
    s.box(530, 60, 130, 46, "decision + risks", EMERALD, sub="with kill criteria")
    s.text(360, 150, "defense = showing the losing options were beaten by EVIDENCE, not preference:", size=11.5, color=MUTED)
    s.text(360, 172, "numbers for the winner, numbers for the runner-up, and what would change your mind", size=11.5, color=MUTED)
    s.save(out)

def debug_kv_budget(out):
    s = SVG(720, 230, "The bug: sizing the cache by query heads")
    s.text(80, 70, "32 query heads", size=12, color=CYAN, anchor="start")
    for i in range(16):
        s.rect(80 + i * 22, 80, 18, 22, fill=CYAN + "22", stroke=CYAN, rx=3, sw=1)
    s.text(444, 94, "…×32", size=11, color=MUTED, anchor="start", mono=True)
    s.text(80, 138, "8 KV heads (shared)", size=12, color=EMERALD, anchor="start")
    for i in range(8):
        s.rect(80 + i * 44, 148, 38, 24, fill=EMERALD + "26", stroke=EMERALD, rx=3)
    s.text(520, 92, "bytes = 2·L·T·H·d·b", size=12, color=TEXT, anchor="start", mono=True)
    s.text(520, 118, "H = kv_heads = 8 ✓", size=12, color=EMERALD, anchor="start", mono=True)
    s.text(520, 142, "H = query heads = 32 ✗", size=12, color=ROSE, anchor="start", mono=True)
    s.text(520, 164, "→ 4× overcount", size=11.5, color=ROSE, anchor="start", mono=True)
    s.text(360, 208, "GQA exists precisely so the cache scales with KV heads, not query heads", size=11.5, color=MUTED)
    s.save(out)

DIAGRAMS = [
    ("c2/rmsnorm_vs_layernorm.svg", rmsnorm_vs_layernorm),
    ("c2/gqa_heads.svg", gqa_heads),
    ("c2/moe_router.svg", moe_router),
    ("c2/modern_block.svg", modern_block),
    ("c2/io_aware.svg", io_aware),
    ("c2/kv_cache_growth.svg", kv_cache_growth),
    ("c2/debug_rmsnorm.svg", debug_rmsnorm),
    ("c3/bert_vs_gpt_mask.svg", bert_vs_gpt_mask),
    ("c3/local_global_masks.svg", local_global_masks),
    ("c3/moe_systems_cost.svg", moe_systems_cost),
    ("c3/ssm_vs_attention.svg", ssm_vs_attention),
    ("c3/config_forensics.svg", config_forensics),
    ("c3/decision_defense.svg", decision_defense),
    ("c3/debug_kv_budget.svg", debug_kv_budget),
]
