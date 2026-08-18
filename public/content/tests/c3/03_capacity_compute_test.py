one=swiglu_parameters(4096,11008)
assert one==3*4096*11008
r=moe_report(width=4096,hidden_width=11008,experts=8,top_k=2)
# router = width × experts; total = 8 experts + router
_expert = swiglu_parameters(4096,11008)
_router = 4096 * 8
assert r["total_parameters"] == 8*_expert + _router, \
    f"total_parameters: expected {8*_expert+_router}, got {r['total_parameters']}"
assert r["active_parameters_per_token"] == 2*_expert, \
    f"active: expected {2*_expert} (top-2 of 8 experts), got {r['active_parameters_per_token']}"
assert r["total_parameters"]>3*r["active_parameters_per_token"]
assert r["active_parameters_per_token"]>swiglu_parameters(4096,11008)
print(f"✓ total: {r['total_parameters']:,}")
print(f"✓ active: {r['active_parameters_per_token']:,}")
print("\n+200 XP — MoE Capacity & Compute complete.")
