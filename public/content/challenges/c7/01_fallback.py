from dataclasses import dataclass
from typing import Optional
@dataclass
class SearchResult:
    route:str; results:list; fallback_reason:Optional[str]=None
def search_with_fallback(query:str,ai_available:bool,cache_hit:bool,ai_timeout:bool=False)->SearchResult:
    """Return a SearchResult with route and optional fallback_reason.

    Routing priority (first matching rule wins):
      1. ai_available=True,  ai_timeout=False  -> route="ai-rewrite",      fallback_reason=None
      2. ai_available=True,  ai_timeout=True   -> route="cached"  (if cache_hit) or "lexical-fallback",
                                                   fallback_reason="TimeoutError"
      3. ai_available=False, cache_hit=True    -> route="cached",           fallback_reason="Unavailable"
      4. ai_available=False, cache_hit=False   -> route="lexical-fallback", fallback_reason="Unavailable"
    """
    raise NotImplementedError
