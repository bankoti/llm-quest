"""Two deliberately small tokenizers: characters first, byte-level BPE second."""

from collections import Counter
from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Tuple


@dataclass
class CharacterTokenizer:
    """A lossless tokenizer over the characters observed in a corpus."""

    chars: List[str]

    @classmethod
    def train(cls, text: str) -> "CharacterTokenizer":
        if not text:
            raise ValueError("Cannot train a tokenizer on empty text")
        return cls(sorted(set(text)))

    @property
    def vocab_size(self) -> int:
        return len(self.chars)

    @property
    def stoi(self) -> Dict[str, int]:
        return {char: index for index, char in enumerate(self.chars)}

    def encode(self, text: str) -> List[int]:
        lookup = self.stoi
        try:
            return [lookup[char] for char in text]
        except KeyError as error:
            raise ValueError(
                "The prompt contains a character absent from the training corpus: "
                + repr(error.args[0])
            ) from error

    def decode(self, token_ids: Iterable[int]) -> str:
        try:
            return "".join(self.chars[token_id] for token_id in token_ids)
        except IndexError as error:
            raise ValueError("Token id is outside the character vocabulary") from error

    def to_dict(self) -> Dict[str, object]:
        return {"type": "character", "chars": self.chars}

    @classmethod
    def from_dict(cls, state: Dict[str, object]) -> "CharacterTokenizer":
        if state.get("type") != "character":
            raise ValueError("Checkpoint does not contain a character tokenizer")
        chars = state.get("chars")
        if not isinstance(chars, list) or not all(isinstance(c, str) for c in chars):
            raise ValueError("Invalid character tokenizer state")
        return cls(chars)


class BytePairTokenizer:
    """Educational byte-level BPE with no regex pre-tokenization.

    Real tokenizers add pre-tokenization rules and special-token handling. This
    version stays small enough to understand in one sitting while preserving the
    central BPE idea: repeatedly merge the most frequent adjacent pair.
    """

    def __init__(self, merges: Sequence[Tuple[int, int]] = ()) -> None:
        self.merges = list(merges)
        self.merge_ranks = {pair: rank for rank, pair in enumerate(self.merges)}
        self.vocab = self._build_vocab()

    @property
    def vocab_size(self) -> int:
        return len(self.vocab)

    @staticmethod
    def _pair_counts(ids: Sequence[int]) -> Counter:
        return Counter(zip(ids, ids[1:]))

    @staticmethod
    def _merge(ids: Sequence[int], pair: Tuple[int, int], new_id: int) -> List[int]:
        merged: List[int] = []
        index = 0
        while index < len(ids):
            if index + 1 < len(ids) and (ids[index], ids[index + 1]) == pair:
                merged.append(new_id)
                index += 2
            else:
                merged.append(ids[index])
                index += 1
        return merged

    @classmethod
    def train(cls, text: str, vocab_size: int = 300) -> "BytePairTokenizer":
        if vocab_size < 256:
            raise ValueError("Byte-level BPE needs at least 256 vocabulary entries")
        ids = list(text.encode("utf-8"))
        if not ids:
            raise ValueError("Cannot train a tokenizer on empty text")

        merges: List[Tuple[int, int]] = []
        for new_id in range(256, vocab_size):
            counts = cls._pair_counts(ids)
            if not counts:
                break
            # Lexicographic tie-breaking makes training deterministic.
            pair = min(counts, key=lambda candidate: (-counts[candidate], candidate))
            if counts[pair] < 2:
                break
            ids = cls._merge(ids, pair, new_id)
            merges.append(pair)
        return cls(merges)

    def _build_vocab(self) -> Dict[int, bytes]:
        vocab = {token_id: bytes([token_id]) for token_id in range(256)}
        for token_id, (left, right) in enumerate(self.merges, start=256):
            vocab[token_id] = vocab[left] + vocab[right]
        return vocab

    def encode(self, text: str) -> List[int]:
        ids = list(text.encode("utf-8"))
        while len(ids) >= 2:
            pairs = zip(ids, ids[1:])
            pair = min(pairs, key=lambda p: self.merge_ranks.get(p, float("inf")))
            rank = self.merge_ranks.get(pair)
            if rank is None:
                break
            ids = self._merge(ids, pair, 256 + rank)
        return ids

    def decode(self, token_ids: Iterable[int]) -> str:
        try:
            raw = b"".join(self.vocab[token_id] for token_id in token_ids)
        except KeyError as error:
            raise ValueError("Token id is outside the BPE vocabulary") from error
        return raw.decode("utf-8", errors="replace")

    def to_dict(self) -> Dict[str, object]:
        return {"type": "byte_pair", "merges": [list(pair) for pair in self.merges]}

    @classmethod
    def from_dict(cls, state: Dict[str, object]) -> "BytePairTokenizer":
        if state.get("type") != "byte_pair":
            raise ValueError("Checkpoint does not contain a byte-pair tokenizer")
        raw_merges = state.get("merges")
        if not isinstance(raw_merges, list):
            raise ValueError("Invalid BPE tokenizer state")
        merges = [tuple(int(value) for value in pair) for pair in raw_merges]
        return cls(merges)
