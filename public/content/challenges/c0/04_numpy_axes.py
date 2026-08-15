"""NumPy axes: reduce, normalize, multiply, and mask in the right direction."""
import numpy as np


def col_means(M: np.ndarray) -> np.ndarray:
    """Mean of each column: shape (rows, cols) -> shape (cols,).

    axis=0 collapses rows (moves DOWN each column). Remember it as:
    the axis you name is the one that disappears.
    """
    raise NotImplementedError


def row_normalize(M: np.ndarray) -> np.ndarray:
    """Each row scaled to sum to 1.

    Divide M by its row sums. keepdims=True keeps the sum shaped
    (rows, 1) so broadcasting lines it up against (rows, cols).
    Assume all row sums are nonzero.
    """
    raise NotImplementedError


def pairwise_scores(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Dot product of every row of A with every row of B.

    A is (n, d), B is (m, d); the result is (n, m). One matmul against
    the transpose: A @ B.T. This exact line is attention's first step.
    """
    raise NotImplementedError


def mask_scores(S: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Keep S where mask is True; set -inf where mask is False.

    np.where(mask, S, -np.inf). Masked positions become -inf so that a
    later softmax sends them to exactly zero: this is how causal masking
    works in every attention implementation.
    """
    raise NotImplementedError
