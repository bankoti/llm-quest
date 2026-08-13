from dataclasses import dataclass
from typing import Optional
@dataclass
class CacheEntry:
    key:str; value:str; model_version:str; index_version:str
class VersionedCache:
    def __init__(self,model_version:str,index_version:str):
        self.model_version=model_version; self.index_version=index_version; self._store={}
    def put(self,entry:CacheEntry)->None:
        raise NotImplementedError
    def get(self,key:str)->Optional[CacheEntry]:
        raise NotImplementedError
