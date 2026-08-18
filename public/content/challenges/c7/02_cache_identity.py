from dataclasses import dataclass
from typing import Optional
@dataclass
class CacheEntry:
    key:str; value:str; model_version:str; index_version:str
class VersionedCache:
    def __init__(self,model_version:str,index_version:str):
        self.model_version=model_version; self.index_version=index_version; self._store={}
    def put(self,entry:CacheEntry)->None:
        """Store entry. Raise ValueError if entry.model_version or
        entry.index_version does not match the cache's current versions."""
        raise NotImplementedError
    def get(self,key:str)->Optional[CacheEntry]:
        """Return the CacheEntry for key, or None if it does not exist or
        its stored model_version / index_version no longer matches the
        cache's current versions (stale entries are invisible)."""
        raise NotImplementedError
