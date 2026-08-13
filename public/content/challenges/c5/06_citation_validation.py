from dataclasses import dataclass
from typing import List
@dataclass
class Passage:
    id:str; text:str
@dataclass
class Claim:
    text:str; cited_passage_ids:List[str]
def validate_citations(claims:List[Claim],passages:List[Passage])->dict:
    raise NotImplementedError
