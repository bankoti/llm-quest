"""Math toolbox: the four math-module moves the whole curriculum leans on."""
import math


def ceil_div(a: int, b: int) -> int:
    """Integer ceiling division: how many size-b buckets hold a items.

    ceil_div(7, 2) == 4. Used everywhere sizing happens: GPUs per model,
    batches per dataset, blocks per sequence. Return an int.
    Either math.ceil(a / b) or the classic (a + b - 1) // b works
    (the // form is exact even for huge ints).
    """
    raise NotImplementedError


def solve_exponent(base: float, threshold: float) -> int:
    """Smallest integer n >= 1 with base**n <= threshold.

    Assumes 0 < base < 1 and 0 < threshold < 1.
    This is 'how many samples until failure probability drops below x':
    take logs (both are negative, so the inequality flips) and ceil:
        n = ceil(log(threshold) / log(base))
    """
    raise NotImplementedError


def n_choose_k(n: int, k: int) -> int:
    """Number of ways to pick k items from n: math.comb does this exactly.

    Shows up in majority voting and sampling math. Return an int.
    """
    raise NotImplementedError


def close_enough(a: float, b: float) -> bool:
    """True when two floats are equal for practical purposes.

    Use math.isclose with its defaults. Never compare floats with ==:
    0.1 + 0.2 != 0.3 in binary floating point.
    """
    raise NotImplementedError
