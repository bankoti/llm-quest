from dataclasses import dataclass
from typing import List
@dataclass
class Passage:
    id:str; text:str
@dataclass
class Claim:
    text:str; cited_passage_ids:List[str]
def validate_citations(claims:List[Claim],passages:List[Passage])->dict:
    """Validate that every claim's cited passages exist and are provided.

    A claim is VALID if all its cited_passage_ids appear in `passages`.
    A claim is INVALID if any cited id is missing from `passages`.
    A passage is UNCITED if its id is not referenced by any claim.

    Returns a dict with keys:
        'valid_claims'     — list of Claim objects that pass
        'invalid_claims'   — list of Claim objects with missing citations
        'uncited_passages' — list of passage ids not referenced by any claim
    """
    raise NotImplementedError
