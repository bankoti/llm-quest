"""Tiny SVG toolkit for lesson diagrams. Dark theme matching the app UI.

Every diagram is code so it can be regenerated / restyled in one pass:
    python scripts/diagrams/generate.py
"""
import html

# Palette (matches Tailwind classes used in the app)
BG      = "#0b0f19"   # panel background
BORDER  = "#1f2937"   # gray-800
TEXT    = "#e5e7eb"   # gray-200
MUTED   = "#9ca3af"   # gray-400
FAINT   = "#4b5563"   # gray-600
VIOLET  = "#a78bfa"
CYAN    = "#67e8f9"
AMBER   = "#fbbf24"
EMERALD = "#34d399"
ROSE    = "#fb7185"
BLUE    = "#60a5fa"

SANS = "'Segoe UI', system-ui, sans-serif"
MONO = "ui-monospace, 'Cascadia Code', Consolas, monospace"


def esc(s):
    return html.escape(str(s), quote=True)


class SVG:
    def __init__(self, w, h, title=""):
        self.w, self.h = w, h
        self.parts = []
        if title:
            self.text(w / 2, 24, title, size=15, color=TEXT, anchor="middle", weight="600")

    # --- primitives -------------------------------------------------------
    def raw(self, s):
        self.parts.append(s)

    def rect(self, x, y, w, h, fill="none", stroke=BORDER, rx=6, sw=1.5, dash=None, opacity=1):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"{d}/>')

    def text(self, x, y, s, size=12, color=TEXT, anchor="middle", mono=False, weight="400", opacity=1):
        fam = MONO if mono else SANS
        self.parts.append(
            f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" fill="{color}" '
            f'text-anchor="{anchor}" font-weight="{weight}" opacity="{opacity}">{esc(s)}</text>')

    def line(self, x1, y1, x2, y2, color=FAINT, sw=1.5, dash=None, opacity=1):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{sw}" opacity="{opacity}"{d}/>')

    def poly(self, pts, color=CYAN, sw=2, fill="none", dash=None, opacity=1):
        p = " ".join(f"{x},{y}" for x, y in pts)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<polyline points="{p}" fill="{fill}" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linejoin="round" stroke-linecap="round" opacity="{opacity}"{d}/>')

    def circle(self, x, y, r, fill=VIOLET, stroke="none", opacity=1):
        self.parts.append(
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" opacity="{opacity}"/>')

    def arrow(self, x1, y1, x2, y2, color=MUTED, sw=1.6, label="", label_dy=-6, dash=None):
        import math
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"{d}/>')
        ang = math.atan2(y2 - y1, x2 - x1)
        for da in (2.6, -2.6):
            xa = x2 - 9 * math.cos(ang + da)
            ya = y2 - 9 * math.sin(ang + da)
            self.parts.append(
                f'<line x1="{x2}" y1="{y2}" x2="{xa}" y2="{ya}" stroke="{color}" stroke-width="{sw}"/>')
        if label:
            self.text((x1 + x2) / 2, (y1 + y2) / 2 + label_dy, label, size=11, color=color)

    # --- compounds --------------------------------------------------------
    def box(self, x, y, w, h, label, color=VIOLET, sub="", mono=False, fill=None):
        self.rect(x, y, w, h, fill=fill or (color + "22"), stroke=color, rx=8)
        cy = y + h / 2 + (0 if not sub else -6)
        self.text(x + w / 2, cy + 4, label, size=12.5, color=TEXT, weight="600", mono=mono)
        if sub:
            self.text(x + w / 2, cy + 20, sub, size=10.5, color=MUTED, mono=mono)

    def grid(self, x, y, cell, rows, cols, values=None, colors=None, labels_top=None,
             labels_left=None, fmt="{}", label_size=10.5):
        """Matrix of cells. values[r][c] text; colors[r][c] fill."""
        for r in range(rows):
            for c in range(cols):
                fill = colors[r][c] if colors else BG
                self.rect(x + c * cell, y + r * cell, cell, cell, fill=fill, stroke=BORDER, rx=3, sw=1)
                if values is not None and values[r][c] is not None:
                    self.text(x + c * cell + cell / 2, y + r * cell + cell / 2 + 3.5,
                              fmt.format(values[r][c]), size=label_size, color=TEXT, mono=True)
        if labels_top:
            for c, s in enumerate(labels_top):
                self.text(x + c * cell + cell / 2, y - 8, s, size=10.5, color=MUTED, mono=True)
        if labels_left:
            for r, s in enumerate(labels_left):
                self.text(x - 8, y + r * cell + cell / 2 + 3.5, s, size=10.5, color=MUTED,
                          anchor="end", mono=True)

    def axis(self, x, y, w, h, xlabel="", ylabel=""):
        """Simple L axis; returns (x0, y0) = origin at bottom-left."""
        self.line(x, y, x, y + h, color=FAINT)
        self.line(x, y + h, x + w, y + h, color=FAINT)
        if xlabel:
            self.text(x + w / 2, y + h + 26, xlabel, size=11, color=MUTED)
        if ylabel:
            self.parts.append(
                f'<text x="{x - 28}" y="{y + h / 2}" font-family="{SANS}" font-size="11" fill="{MUTED}" '
                f'text-anchor="middle" transform="rotate(-90 {x - 28} {y + h / 2})">{esc(ylabel)}</text>')
        return x, y + h

    def legend(self, x, y, items, mono=False):
        """items: list of (color, label). Horizontal legend."""
        cx = x
        for color, label in items:
            self.rect(cx, y - 9, 14, 10, fill=color, stroke="none", rx=2)
            self.text(cx + 20, y, label, size=11, color=MUTED, anchor="start", mono=mono)
            cx += 34 + len(label) * 6.2

    def save(self, path):
        body = "\n".join(self.parts)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" '
               f'font-family="{SANS}">\n'
               f'<rect width="{self.w}" height="{self.h}" fill="{BG}" rx="10"/>\n{body}\n</svg>\n')
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(svg)
