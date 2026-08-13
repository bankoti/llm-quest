from dataclasses import dataclass
from typing import Optional
@dataclass
class SearchResult:
    route:str; results:list; fallback_reason:Optional[str]=None
def search_with_fallback(query:str,ai_available:bool,cache_hit:bool,ai_timeout:bool=False)->SearchResult:
    raise NotImplementedError
