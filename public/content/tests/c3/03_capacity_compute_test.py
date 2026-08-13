one=swiglu_parameters(4096,11008)
assert one==3*4096*11008
r=moe_report(width=4096,hidden_width=11008,experts=8,top_k=2)
assert r["total_parameters"]>3*r["active_parameters_per_token"]
assert r["active_parameters_per_token"]>swiglu_parameters(4096,11008)
print(f"✓ total: {r['total_parameters']:,}")
print(f"✓ active: {r['active_parameters_per_token']:,}")
print("\n+200 XP — MoE Capacity & Compute complete.")
