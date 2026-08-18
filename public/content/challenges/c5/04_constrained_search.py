from dataclasses import dataclass
from typing import List,Optional
@dataclass
class Item:
    id:str; price:float; category:str; tags:List[str]
def parse_price_constraint(query:str)->Optional[float]:
    """Extract a price ceiling from a natural-language query string.

    Look for patterns like 'under 20 dollars', 'under $15', 'below 30'.
    Return the numeric value as a float, or None if no price constraint found.
    Examples: 'cheap noodles under 20 dollars' -> 20.0
              'under $15' -> 15.0
              'best protein bars' -> None
    """
    raise NotImplementedError
def apply_constraints(items,max_price=None,category=None,required_tags=None)->List[Item]:
    """Filter items to those satisfying all provided hard constraints.

    A constraint is only applied when the argument is not None:
        max_price:     keep items where price <= max_price
        category:      keep items where category == category
        required_tags: keep items where ALL required_tags are in item.tags
    Returns a new list (original order preserved).
    """
    raise NotImplementedError
