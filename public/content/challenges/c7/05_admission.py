from dataclasses import dataclass
@dataclass
class AdmissionController:
    max_queue_depth:int; max_p99_ms:float; current_queue_depth:int=0; current_p99_ms:float=0.
    def admit(self)->bool: raise NotImplementedError
    def update(self,queue_depth:int,p99_ms:float)->None: raise NotImplementedError
