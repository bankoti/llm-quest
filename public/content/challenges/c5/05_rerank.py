from dataclasses import dataclass
from typing import List
@dataclass
class Candidate:
    id:str; retrieval_score:float; rerank_score:float; in_stock:bool
def rerank(candidates:List[Candidate],*,min_rerank_score:float=0.,require_in_stock:bool=True)->List[str]:
    raise NotImplementedError
