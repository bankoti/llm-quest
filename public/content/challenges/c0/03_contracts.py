"""Contracts: implement exactly what the docstring and test demand."""


def clamp(x: float, lo: float, hi: float) -> float:
    """x limited to the range [lo, hi].

    clamp(5, 0, 3) == 3. min and max compose: max(lo, min(x, hi)).
    """
    raise NotImplementedError


def safe_ratio(num: float, den: float, default: float = 0.0) -> float:
    """num / den, or default when den is zero.

    Guard first, divide second. The default parameter means callers who
    don't care about the edge case never mention it.
    """
    raise NotImplementedError


def missing_keys(config: dict, required: list) -> list:
    """The required keys absent from config, in required order.

    missing_keys({'lr': 3e-4}, ['lr', 'batch', 'steps']) == ['batch', 'steps'].
    A comprehension with `not in` reads like the sentence above.
    """
    raise NotImplementedError


def range_error(name: str, value: float, lo: float, hi: float) -> str:
    """'' when lo <= value <= hi, else exactly:

        '<name>=<value> outside [<lo>, <hi>]'

    Build it with an f-string: f"{name}={value} outside [{lo}, {hi}]".
    Match the format character for character; the test compares strings.
    """
    raise NotImplementedError
