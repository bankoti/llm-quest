"""Course 1 diagrams: foundations."""
from svgkit import *

def tensors(out):
    s = SVG(720, 240, "One data structure, growing ranks")
    # scalar
    s.circle(70, 120, 5, fill=CYAN)
    s.text(70, 150, "scalar", size=11, color=MUTED); s.text(70, 166, "()", size=11, color=CYAN, mono=True)
    # vector
    s.grid(130, 108, 24, 1, 5)
    s.text(190, 150, "vector", size=11, color=MUTED); s.text(190, 166, "(D,)", size=11, color=CYAN, mono=True)
    # matrix
    s.grid(300, 84, 24, 3, 5)
    s.text(360, 172, "matrix — T rows of D", size=11, color=MUTED)
    s.text(360, 188, "(T, D)", size=11, color=CYAN, mono=True)
    # batch
    for i, op in ((2, 0.35), (1, 0.6), (0, 1.0)):
        s.rect(480 + i * 10, 74 + i * 10, 120, 72, fill=BG, stroke=VIOLET, opacity=op, rx=4)
    s.grid(500, 94, 24, 3, 5)
    s.text(560, 172, "batch — B matrices", size=11, color=MUTED)
    s.text(560, 188, "(B, T, D)", size=11, color=CYAN, mono=True)
    s.arrow(95, 120, 122, 120); s.arrow(262, 120, 292, 120); s.arrow(430, 120, 472, 120)
    s.text(360, 222, "every shape in this course is one of these, with names attached", size=11.5, color=MUTED)
    s.save(out)

def tokenization_pipeline(out):
    s = SVG(720, 200, "The tokenizer contract: text in, integers out, text back")
    s.box(30, 70, 130, 44, '"the cat sat"', CYAN, mono=True)
    s.arrow(160, 92, 205, 92, label="encode")
    s.box(205, 70, 170, 44, "[464, 3797, 3332]", VIOLET, sub="token IDs", mono=True)
    s.arrow(375, 92, 420, 92, label="embed")
    s.box(420, 70, 150, 44, "(T, D) vectors", EMERALD, sub="model input", mono=True)
    s.arrow(285, 114, 285, 148); s.arrow(285, 148, 160, 148); s.arrow(160, 148, 108, 118, label="")
    s.text(230, 165, "decode(encode(text)) == text  — round-trip must hold", size=11.5, color=MUTED, anchor="start", mono=True)
    s.save(out)

def bpe_merges(out):
    s = SVG(720, 250, "BPE: repeatedly merge the most frequent adjacent pair")
    rows = [
        ("start",   ["l","o","w","e","r","_"], []),
        ("merge 1", ["lo","w","e","r","_"],    [0]),
        ("merge 2", ["low","e","r","_"],       [0]),
        ("merge 3", ["low","er","_"],          [1]),
    ]
    y = 56
    for label, toks, hot in rows:
        s.text(96, y + 20, label, size=11, color=MUTED, anchor="end", mono=True)
        x = 112
        for i, t in enumerate(toks):
            w = 26 + len(t) * 10
            col = AMBER if i in hot else FAINT
            fill = AMBER + "26" if i in hot else BG
            s.rect(x, y, w, 32, fill=fill, stroke=col, rx=6)
            s.text(x + w / 2, y + 20, t, size=12.5, color=TEXT, mono=True)
            x += w + 8
        y += 46
    s.text(360, 238, "vocabulary grows by one entry per merge; frequent words become single tokens", size=11.5, color=MUTED)
    s.save(out)

def data_pipeline(out):
    s = SVG(720, 230, "Inputs and targets: the same window, shifted by one")
    ids = [17, 4, 9, 31, 8, 22, 5, 11, 40]
    s.text(56, 76, "tokens", size=11, color=MUTED, anchor="end", mono=True)
    s.grid(70, 58, 42, 1, 9, values=[[str(v) for v in ids]])
    # x window
    s.rect(70, 112, 42 * 6, 34, fill=CYAN + "1c", stroke=CYAN, rx=6)
    s.grid(70, 112, 42, 1, 6, values=[[str(v) for v in ids[:6]]])
    s.text(56, 133, "x", size=13, color=CYAN, anchor="end", mono=True)
    # y window
    s.rect(112, 160, 42 * 6, 34, fill=ROSE + "1c", stroke=ROSE, rx=6)
    s.grid(112, 160, 42, 1, 6, values=[[str(v) for v in ids[1:7]]])
    s.text(98, 181, "y", size=13, color=ROSE, anchor="end", mono=True)
    for i in range(6):
        s.arrow(70 + i * 42 + 21, 148, 112 + i * 42 + 21 - 21 + 10, 158, color=FAINT, sw=1)
    s.text(360, 218, "position t of x predicts position t of y — every window yields T training examples", size=11.5, color=MUTED)
    s.save(out)

def bigram_counts(out):
    s = SVG(720, 260, "Bigram model: a lookup table of next-token counts")
    vocab = ["a", "b", "c", "."]
    counts = [[2, 14, 1, 3], [9, 0, 5, 6], [1, 7, 0, 12], [8, 2, 10, 0]]
    mx = 14
    colors = [[f"{VIOLET}{int(15 + 70 * v / mx):02x}" for v in row] for row in counts]
    s.grid(120, 70, 38, 4, 4, values=counts, colors=colors, labels_top=vocab, labels_left=vocab)
    s.text(196, 250, "rows: current token", size=11, color=MUTED)
    s.arrow(300, 128, 380, 128)
    s.text(340, 116, "normalize row", size=10.5, color=MUTED)
    probs = [[0.47], [0.0], [0.24], [0.29]]
    s.grid(390, 70, 52, 4, 1, values=[[f"{p[0]:.2f}"] for p in probs], labels_left=vocab,
           colors=[[f"{EMERALD}{int(15 + 70 * p[0] / 0.5):02x}"] for p in probs])
    s.text(416, 250, 'P(next | "a")', size=11, color=MUTED, mono=True)
    s.text(560, 120, "training = counting", size=12, color=TEXT, weight="600")
    s.text(560, 140, "sampling = one row lookup", size=11.5, color=MUTED)
    s.text(560, 160, "no context beyond", size=11.5, color=MUTED)
    s.text(560, 176, "the previous token", size=11.5, color=MUTED)
    s.save(out)

def gradients_graph(out):
    s = SVG(720, 250, "Forward computes values; backward computes blame")
    s.box(40, 60, 74, 40, "x = 2", CYAN, mono=True)
    s.box(40, 130, 74, 40, "w = 3", CYAN, mono=True)
    s.box(180, 95, 80, 40, "m = x·w", VIOLET, sub="m = 6", mono=True)
    s.box(330, 95, 90, 40, "y = m + b", VIOLET, sub="y = 7", mono=True)
    s.box(490, 95, 110, 40, "L = (y − t)²", AMBER, sub="L = 4", mono=True)
    s.arrow(114, 80, 176, 105, color=FAINT); s.arrow(114, 150, 176, 125, color=FAINT)
    s.arrow(260, 115, 326, 115, color=FAINT); s.arrow(420, 115, 486, 115, color=FAINT)
    # backward
    s.arrow(486, 165, 420, 165, color=ROSE, label="dL/dy = 2(y−t) = 4")
    s.arrow(326, 165, 260, 165, color=ROSE, label="dL/dm = 4")
    s.arrow(176, 165, 114, 190, color=ROSE, label="dL/dw = 4·x = 8")
    s.text(360, 226, "chain rule: each node multiplies the gradient flowing back by its local derivative", size=11.5, color=MUTED)
    s.save(out)

def attention_flow(out):
    s = SVG(720, 300, "One attention head, end to end")
    s.box(30, 120, 90, 44, "x", CYAN, sub="(T, D)", mono=True)
    for i, (nm, yy) in enumerate((("Q", 50), ("K", 120), ("V", 190))):
        s.arrow(120, 142, 165, yy + 22, color=FAINT)
        s.box(168, yy, 84, 44, f"{nm} = xW{nm.lower()}", VIOLET, sub="(T, D)", mono=True)
    s.arrow(252, 72, 306, 100, color=FAINT); s.arrow(252, 142, 306, 120, color=FAINT)
    s.box(308, 88, 118, 44, "QKᵀ/√d + mask", AMBER, sub="scores (T, T)", mono=True)
    s.arrow(426, 110, 470, 110, label="softmax")
    s.box(472, 88, 92, 44, "weights", EMERALD, sub="rows sum to 1", mono=True)
    s.arrow(252, 212, 508, 140, color=FAINT)
    s.arrow(564, 110, 606, 110, label="@ V")
    s.box(606, 88, 84, 44, "out", CYAN, sub="(T, D)", mono=True)
    s.text(360, 282, "each output row is a weighted mixture of value rows — weights depend on content", size=11.5, color=MUTED)
    s.save(out)

def causal_mask(out):
    s = SVG(720, 280, "The causal mask: position t may only look left")
    n = 6
    cell = 32
    vals, cols = [], []
    for r in range(n):
        vrow, crow = [], []
        for c in range(n):
            if c <= r:
                vrow.append("·"); crow.append(EMERALD + "30")
            else:
                vrow.append("-∞"); crow.append(ROSE + "26")
        vals.append(vrow); cols.append(crow)
    s.grid(140, 64, cell, n, n, values=vals, colors=cols,
           labels_top=[f"k{c}" for c in range(n)], labels_left=[f"q{r}" for r in range(n)])
    s.legend(400, 84, [(EMERALD, "allowed (score kept)"), ], mono=False)
    s.legend(400, 112, [(ROSE, "-∞ before softmax → weight 0")])
    s.text(400, 152, "after softmax each row is a distribution", size=11.5, color=MUTED, anchor="start")
    s.text(400, 170, "over positions ≤ t only", size=11.5, color=MUTED, anchor="start")
    s.text(360, 262, "-∞ (not 0!) is what makes a forbidden position truly invisible", size=11.5, color=AMBER)
    s.save(out)

def transformer_stack(out):
    s = SVG(720, 330, "Decoder-only Transformer: a residual stream with taps")
    s.box(60, 270, 140, 40, "token + position", CYAN, sub="embeddings")
    s.arrow(130, 268, 130, 246)
    s.rect(48, 96, 220, 148, fill=VIOLET + "10", stroke=VIOLET, dash="5,4")
    s.text(58, 116, "× N blocks", size=11, color=VIOLET, anchor="start", weight="600")
    s.box(76, 188, 164, 36, "LN → attention → ⊕", VIOLET, mono=True)
    s.arrow(158, 186, 158, 168)
    s.box(76, 130, 164, 36, "LN → MLP → ⊕", VIOLET, mono=True)
    s.arrow(158, 128, 158, 96); s.arrow(158, 94, 158, 78)
    s.box(76, 36, 164, 40, "final LN → lm_head", EMERALD, sub="logits (T, vocab)")
    # residual stream annotation
    s.line(300, 60, 300, 290, color=CYAN, sw=3, opacity=0.7)
    s.text(316, 80, "the residual stream", size=12.5, color=CYAN, anchor="start", weight="600")
    s.text(316, 100, "shape (B, T, D) everywhere", size=11.5, color=MUTED, anchor="start", mono=True)
    s.text(316, 126, "attention: moves information between positions", size=11.5, color=MUTED, anchor="start")
    s.text(316, 146, "MLP: transforms each position independently", size=11.5, color=MUTED, anchor="start")
    s.text(316, 172, "blocks only ADD to the stream (⊕) —", size=11.5, color=MUTED, anchor="start")
    s.text(316, 192, "gradients flow through untouched identity path", size=11.5, color=MUTED, anchor="start")
    s.save(out)

def debug_mask_zero(out):
    s = SVG(720, 240, "The bug: masking with 0 instead of -∞")
    s.text(120, 66, "scores + 0 at masked spots", size=12, color=ROSE, anchor="start", weight="600")
    s.grid(120, 80, 44, 1, 4, values=[["2.1", "0.4", "0", "0"]],
           colors=[[BG, BG, ROSE + "26", ROSE + "26"]])
    s.arrow(310, 102, 360, 102, label="softmax")
    s.grid(370, 80, 44, 1, 4, values=[[".62", ".11", ".13", ".13"]],
           colors=[[BG, BG, ROSE + "26", ROSE + "26"]])
    s.text(370, 150, "e⁰ = 1 → future positions still get weight", size=11.5, color=ROSE, anchor="start")
    s.text(120, 186, "with -∞: e⁻∞ = 0 → weights [.85, .15, 0, 0]", size=11.5, color=EMERALD, anchor="start", mono=True)
    s.text(360, 222, "a mask must remove a position from the softmax, not just leave its score alone", size=11.5, color=MUTED)
    s.save(out)

DIAGRAMS = [
    ("c1/tensors_shapes.svg", tensors),
    ("c1/tokenizer_contract.svg", tokenization_pipeline),
    ("c1/bpe_merges.svg", bpe_merges),
    ("c1/xy_windows.svg", data_pipeline),
    ("c1/bigram_counts.svg", bigram_counts),
    ("c1/backprop_graph.svg", gradients_graph),
    ("c1/attention_flow.svg", attention_flow),
    ("c1/causal_mask.svg", causal_mask),
    ("c1/transformer_stack.svg", transformer_stack),
    ("c1/debug_mask_zero.svg", debug_mask_zero),
]
