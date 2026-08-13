"""Level 18 — Config Forensics
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class DecoderConfig:
    width:int; layers:int; query_heads:int; kv_heads:int
    head_dim:int; intermediate_width:int; experts:int=1; experts_per_token:int=1

    def validate(self)->None:
        """Raise ValueError for invalid config."""
        raise NotImplementedError

    @property
    def query_width(self)->int: raise NotImplementedError

    @property
    def kv_width(self)->int: raise NotImplementedError

    @property
    def queries_per_kv_head(self)->int: raise NotImplementedError

    def kv_cache_bytes(self, tokens:int, bytes_per_scalar:int=2)->int:
        """2*layers*tokens*kv_width*bytes"""
        raise NotImplementedError
