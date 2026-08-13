from dataclasses import dataclass,field
@dataclass
class CircuitBreaker:
    failure_threshold:int; state:str="closed"; failures:int=0
    def allow(self)->bool: raise NotImplementedError
    def record(self,success:bool)->None: raise NotImplementedError
    def cooldown_elapsed(self)->None: raise NotImplementedError
