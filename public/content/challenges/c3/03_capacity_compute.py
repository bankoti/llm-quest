"""Level 16 — MoE Capacity & Compute
"""
def swiglu_parameters(width:int, hidden_width:int)->int:
    """3 projections * width * hidden_width (no biases)."""
    raise NotImplementedError

def moe_report(width:int, hidden_width:int, experts:int, top_k:int)->dict:
    """Return total_parameters and active_parameters_per_token. Include router."""
    raise NotImplementedError
