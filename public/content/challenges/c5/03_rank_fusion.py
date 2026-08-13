from typing import Sequence
def fuse(rankings:Sequence[Sequence[str]],k:int=60)->dict:
    """RRF: for each unique doc, sum 1/(k+rank). Ignore duplicates within a list."""
    raise NotImplementedError
