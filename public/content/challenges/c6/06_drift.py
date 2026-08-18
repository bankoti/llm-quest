import math
from typing import List
def population_stability_index(reference:List[float],current:List[float],eps:float=1e-6)->float:
    raise NotImplementedError
def chi_squared_distance(reference:List[float],current:List[float],eps:float=1e-6)->float:
    """Chi-squared distance between two distributions.

    χ²(P, Q) = sum_i (P_i - Q_i)² / Q_i

    Use Q_i = reference_i and P_i = current_i.
    Replace any zero reference bin with eps to avoid division by zero.
    Returns 0.0 when distributions are identical.
    """
    raise NotImplementedError
