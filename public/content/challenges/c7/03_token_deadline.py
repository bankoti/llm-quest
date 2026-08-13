def tokens_in_budget(deadline_ms:float,elapsed_ms:float,prefill_ms:float,ms_per_token:float)->int:
    raise NotImplementedError
def should_start(deadline_ms,elapsed_ms,prefill_ms,min_useful_tokens,ms_per_token)->bool:
    raise NotImplementedError
