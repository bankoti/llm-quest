"""Level 2 — Tokenization
Map raw text to integers and back. Pure Python, no libraries.
"""
from typing import Dict, List, Sequence, Tuple

def build_vocabulary(text: str) -> Tuple[Dict[str,int], Dict[int,str]]:
    """Return (char->id, id->char) over every unique character in text."""
    raise NotImplementedError

def encode(text: str, stoi: Dict[str,int]) -> List[int]:
    """Convert a string to a list of integer token ids."""
    raise NotImplementedError

def decode(ids: Sequence[int], itos: Dict[int,str]) -> str:
    """Convert ids back to a string."""
    raise NotImplementedError

def merge_pair(ids: Sequence[int], pair: Tuple[int,int], replacement: int) -> List[int]:
    """Replace every consecutive occurrence of pair with replacement. One BPE merge step."""
    raise NotImplementedError
