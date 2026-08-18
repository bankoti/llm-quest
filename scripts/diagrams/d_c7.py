"""Course 7 diagrams: serving & reliability."""
from svgkit import *

def bounded_queue(out):
    s = SVG(720, 230, "Backpressure: a bounded queue that says no early")
    # incoming requests
    for i, op in enumerate((1.0, 0.75, 0.5, 0.3)):
        s.circle(48 + i * 22, 96, 6, fill=CYAN, opacity=op)
    s.text(70, 126, "requests", size=11, color=MUTED)
    s.arrow(140, 96, 186, 96)
    # bounded queue: filled + empty slots inside a hard border
    s.rect(186, 74, 220, 44, fill=BG, stroke=VIOLET, rx=8)
    for i in range(5):
        s.rect(194 + i * 42, 82, 36, 28, fill=VIOLET + "44", stroke=VIOLET, rx=4, sw=1)
    s.text(296, 136, "queue — max depth 5, full", size=11, color=MUTED)
    s.arrow(406, 96, 452, 96, label="dequeue")
    s.box(452, 74, 130, 44, "GPU server", EMERALD, sub="bounded concurrency")
    # rejection path
    s.arrow(163, 96, 163, 160, color=ROSE)
    s.box(110, 160, 150, 40, "429 / shed load", ROSE, sub="reject at the door")
    s.text(360, 218, "an unbounded queue turns overload into latency for everyone; a bounded one fails fast and keeps served requests fast",
           size=11.5, color=MUTED)
    s.save(out)

DIAGRAMS = [
    ("c7/bounded_queue.svg", bounded_queue),
]
