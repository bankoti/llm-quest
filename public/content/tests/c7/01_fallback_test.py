r1=search_with_fallback("q",True,False)
assert r1.route=="ai-rewrite" and r1.fallback_reason is None
r2=search_with_fallback("q",True,True,ai_timeout=True)
assert r2.fallback_reason=="TimeoutError"
r3=search_with_fallback("q",False,True)
assert r3.route=="cached"
r4=search_with_fallback("q",False,False)
assert r4.route=="lexical-fallback" and r4.fallback_reason=="Unavailable"
print("✓ fallback tiers correct")
print("\n+200 XP — Fallback Behaviour complete.")
