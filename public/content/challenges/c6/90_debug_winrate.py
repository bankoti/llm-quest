"""Debug — The Generous Judge 🐛
An AI assistant wrote the A/B eval aggregator. Model A wins every eval, ships,
and users can't tell the difference. ONE conceptual bug.
"""
from typing import List

def win_rate(judgments: List[str]) -> float:
    """Fraction of pairwise comparisons that model A wins.
    judgments: list of 'A', 'B', or 'tie'."""
    wins = sum(1 for j in judgments if j != 'B')
    return wins / len(judgments)
