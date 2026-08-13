be=break_even_requests(10_000,.002,.0001)
assert abs(be-5_263_158)<10,f"break-even ~5.26M requests, got {be:,.0f}"
pb=months_to_payback(10_000,1000,.002,.0001,5.,.04,.05)
assert abs(pb-6.93)<0.05,f"payback ~6.9mo at 1k/day, got {pb:.2f}"
print(f"✓ break-even={be:,.0f} requests, payback={pb:.1f}mo")
print("\n+200 XP — Cost Break-Even complete.")
