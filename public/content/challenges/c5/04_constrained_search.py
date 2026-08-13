from dataclasses import dataclass
from typing import List,Optional
@dataclass
class Item:
    id:str; price:float; category:str; tags:List[str]
def parse_price_constraint(query:str)->Optional[float]:
    raise NotImplementedError
def apply_constraints(items,max_price=None,category=None,required_tags=None)->List[Item]:
    raise NotImplementedError
