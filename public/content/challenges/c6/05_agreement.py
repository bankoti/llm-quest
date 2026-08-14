from typing import Hashable, Sequence

def cohen_kappa(left: Sequence[Hashable], right: Sequence[Hashable]) -> float:
    """Cohen's kappa: agreement between two annotators, corrected for chance.

        kappa = (p_o - p_e) / (1 - p_e)

    where, over n paired labels:
        p_o = observed agreement = fraction of positions where left == right
        p_e = chance agreement   = sum over labels L of
              P(left == L) * P(right == L)
              (each annotator's marginal frequency of L, multiplied)

    Interpretation: 1.0 = perfect agreement; 0.0 = no better than chance;
    negative = worse than chance. Two annotators who both label 50/50 at
    random agree half the time — kappa correctly scores that 0, where raw
    percent-agreement would flatter them with 0.5.

    kappa is symmetric: cohen_kappa(a, b) == cohen_kappa(b, a).
    """
    raise NotImplementedError
