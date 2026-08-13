be=break_even_daily_requests(.002,.0001,5.,.04,.05)
assert abs(be-380)<1,f"break-even ~380, got {be:.1f}"
pb=months_to_payback(10_000,1000,.002,.0001,5.,.04,.05)
assert pb<12,f"payback<12mo at 1k/day: {pb:.1f}"
print(f"✓ break-even={be:.0f} req/day, payback={pb:.1f}mo")
print("\n+200 XP — Cost Break-Even complete.")
